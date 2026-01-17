import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId, CacheDuration } from '@/lib/api-response';
import type { SchoolInfo, SchoolItem } from '@/types/apartment';

interface SchoolQueryResult {
  school_name: string;
  school_type: string;
  school_kind: string | null;
  distance_m: number;
  student_count: number | null;
}

interface AssignedSchoolResult {
  elementary_school_name: string | null;
  middle_zone_name: string | null;
  school_name: string | null;
  school_kind: string | null;
  distance_m: number | null;
  student_count: number | null;
}

// 도보 시간 계산 (80m/분 기준)
function calcWalkingMinutes(distance: number): number {
  return distance > 0 ? Math.ceil(distance / 80) : 0;
}

// 학교 타입 변환
function mapSchoolType(type: string): 'elementary' | 'middle' | 'high' {
  if (type === '초등학교') return 'elementary';
  if (type === '중학교') return 'middle';
  return 'high';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = validateId(idParam);

    if (!id) {
      return errorResponse('유효하지 않은 아파트 ID입니다', 400);
    }

    // 아파트 좌표 조회
    const apt = await prisma.apt_master.findUnique({
      where: { apt_id: id },
      select: { lat: true, lng: true },
    });

    if (!apt || !apt.lat || !apt.lng) {
      return successResponse<SchoolInfo>({
        nearbyMiddle: [],
        nearbyHigh: [],
      }, { cache: CacheDuration.STATIC });
    }

    const aptLat = Number(apt.lat);
    const aptLng = Number(apt.lng);

    // 배정 초등학교 조회 (학교명 정제 후 raw_schools와 매칭)
    const assignedSchoolResult = await prisma.$queryRaw<AssignedSchoolResult[]>`
      WITH clean_school_names AS (
        SELECT
          apt_id,
          elementary_school_name,
          middle_zone_name,
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(elementary_school_name, '제한적공동\\(일방\\)$', ''),
              '제한적공동$', ''
            ),
            '공동학구$', ''
          ) as clean_name
        FROM apt_assigned_school
        WHERE apt_id = ${id}
      )
      SELECT
        cs.elementary_school_name,
        cs.middle_zone_name,
        s.school_name,
        s.school_kind,
        s.student_count,
        ROUND(
          6371000 * ACOS(
            LEAST(1, GREATEST(-1,
              COS(RADIANS(${aptLat})) * COS(RADIANS(s.lat)) *
              COS(RADIANS(s.lng) - RADIANS(${aptLng})) +
              SIN(RADIANS(${aptLat})) * SIN(RADIANS(s.lat))
            ))
          )
        )::int as distance_m
      FROM clean_school_names cs
      LEFT JOIN raw_schools s ON (
        s.school_name = cs.clean_name || '등학교'
        AND s.school_type = '초등학교'
      )
      LIMIT 1
    `;

    // 가까운 중/고등학교 조회 (반경 2km 이내, 거리순 정렬)
    const nearbySchools = await prisma.$queryRaw<SchoolQueryResult[]>`
      SELECT
        school_name,
        school_type,
        school_kind,
        student_count,
        ROUND(
          6371000 * ACOS(
            LEAST(1, GREATEST(-1,
              COS(RADIANS(${aptLat})) * COS(RADIANS(lat)) *
              COS(RADIANS(lng) - RADIANS(${aptLng})) +
              SIN(RADIANS(${aptLat})) * SIN(RADIANS(lat))
            ))
          )
        )::int as distance_m
      FROM raw_schools
      WHERE school_type IN ('중학교', '고등학교')
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND lat BETWEEN ${aptLat - 0.02} AND ${aptLat + 0.02}
        AND lng BETWEEN ${aptLng - 0.025} AND ${aptLng + 0.025}
      ORDER BY distance_m
      LIMIT 10
    `;

    // 응답 데이터 구성
    const schoolInfo: SchoolInfo = {
      nearbyMiddle: [],
      nearbyHigh: [],
    };

    // 배정 초등학교 설정
    const assigned = assignedSchoolResult[0];
    if (assigned?.elementary_school_name) {
      schoolInfo.middleZoneName = assigned.middle_zone_name || undefined;

      if (assigned.school_name && assigned.distance_m !== null) {
        schoolInfo.assignedElementary = {
          schoolName: assigned.school_name,
          schoolType: 'elementary',
          schoolKind: assigned.school_kind || undefined,
          distance: assigned.distance_m,
          walkingMinutes: calcWalkingMinutes(assigned.distance_m),
          studentCount: assigned.student_count || undefined,
          isAssigned: true,
        };
      }
    }

    // 가까운 중/고등학교 분류
    for (const school of nearbySchools) {
      const item: SchoolItem = {
        schoolName: school.school_name,
        schoolType: mapSchoolType(school.school_type),
        schoolKind: school.school_kind || undefined,
        distance: school.distance_m,
        walkingMinutes: calcWalkingMinutes(school.distance_m),
        studentCount: school.student_count || undefined,
      };

      if (school.school_type === '중학교' && schoolInfo.nearbyMiddle.length < 3) {
        schoolInfo.nearbyMiddle.push(item);
      } else if (school.school_type === '고등학교' && schoolInfo.nearbyHigh.length < 3) {
        schoolInfo.nearbyHigh.push(item);
      }
    }

    return successResponse(schoolInfo, { cache: CacheDuration.STATIC });
  } catch (error) {
    console.error('Schools API error:', error);
    return errorResponse('학교 정보 조회 중 오류가 발생했습니다', 500);
  }
}
