import { Car, Cctv, Building, Zap, Shield, Brush, GraduationCap, Heart, ShoppingBag } from 'lucide-react';
import type { Apartment } from '@/types/apartment';

interface FacilityInfoProps {
  apartment: Apartment;
}

export function FacilityInfo({ apartment }: FacilityInfoProps) {
  const { kaptDetail } = apartment;

  if (!kaptDetail) {
    return null;
  }

  // 주차 정보
  const parkingInfo = kaptDetail.parkingTotal
    ? `총 ${kaptDetail.parkingTotal.toLocaleString()}대` +
      (kaptDetail.parkingGround ? ` (지상 ${kaptDetail.parkingGround.toLocaleString()}대)` : '') +
      (kaptDetail.parkingUnderground ? ` (지하 ${kaptDetail.parkingUnderground.toLocaleString()}대)` : '')
    : null;

  // 전기차 충전기
  const evChargerTotal = (kaptDetail.evChargerGround || 0) + (kaptDetail.evChargerUnderground || 0);
  const evChargerInfo = evChargerTotal > 0 ? `${evChargerTotal}대` : null;

  const facilityItems = [
    {
      icon: Car,
      label: '주차',
      value: parkingInfo,
    },
    {
      icon: Building,
      label: '엘리베이터',
      value: kaptDetail.elevatorCount ? `${kaptDetail.elevatorCount}대` : null,
    },
    {
      icon: Cctv,
      label: 'CCTV',
      value: kaptDetail.cctvCount ? `${kaptDetail.cctvCount}대` : null,
    },
    {
      icon: Zap,
      label: '전기차 충전기',
      value: evChargerInfo,
    },
  ].filter((item) => item.value);

  const managementItems = [
    {
      icon: Shield,
      label: '관리업체',
      value: kaptDetail.managementCompany,
    },
    {
      icon: Shield,
      label: '경비원',
      value: kaptDetail.securityCount ? `${kaptDetail.securityCount}명` : null,
    },
    {
      icon: Brush,
      label: '청소원',
      value: kaptDetail.cleaningCount ? `${kaptDetail.cleaningCount}명` : null,
    },
  ].filter((item) => item.value);

  // 시설 정보 파싱 (쉼표로 구분된 문자열)
  const parseFacilities = (str?: string) => {
    if (!str) return [];
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const welfareFacilities = parseFacilities(kaptDetail.welfareFacility);
  const convenientFacilities = parseFacilities(kaptDetail.convenientFacility);
  const educationFacilities = parseFacilities(kaptDetail.educationFacility);

  const hasFacilities = facilityItems.length > 0 || managementItems.length > 0;
  const hasAmenities = welfareFacilities.length > 0 || convenientFacilities.length > 0 || educationFacilities.length > 0;

  if (!hasFacilities && !hasAmenities) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">시설 정보</h2>

      {/* 주요 시설 */}
      {facilityItems.length > 0 && (
        <dl className="space-y-3">
          {facilityItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-gray-500 dark:text-gray-400">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {/* 관리 정보 */}
      {managementItems.length > 0 && (
        <>
          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">관리</h3>
          <dl className="space-y-3">
            {managementItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </>
      )}

      {/* 부대시설 */}
      {hasAmenities && (
        <>
          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">부대시설</h3>
          <div className="space-y-3">
            {welfareFacilities.length > 0 && (
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">복지시설</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {welfareFacilities.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        {f}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            )}
            {convenientFacilities.length > 0 && (
              <div className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">편의시설</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {convenientFacilities.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {f}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            )}
            {educationFacilities.length > 0 && (
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">교육시설</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {educationFacilities.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      >
                        {f}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
