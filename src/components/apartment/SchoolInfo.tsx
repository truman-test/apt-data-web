import { GraduationCap, MapPin, Clock, Users } from 'lucide-react';
import type { SchoolInfo as SchoolInfoType, SchoolItem } from '@/types/apartment';

interface SchoolInfoProps {
  schoolInfo: SchoolInfoType | null | undefined;
}

function SchoolCard({ school, highlight = false }: { school: SchoolItem; highlight?: boolean }) {
  const bgClass = highlight
    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
    : 'bg-gray-50 dark:bg-gray-700/50';

  return (
    <div className={`rounded-lg p-3 ${bgClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 dark:text-white">
            {school.schoolName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            {school.schoolKind && (
              <span>{school.schoolKind}</span>
            )}
            {school.studentCount && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {school.studentCount.toLocaleString()}명
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {school.distance.toLocaleString()}m
          </span>
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            {school.walkingMinutes}분
          </span>
        </div>
      </div>
      {school.isAssigned && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-200">
            <MapPin className="h-3 w-3" />
            배정 학교
          </span>
        </div>
      )}
    </div>
  );
}

function SchoolSection({ title, schools }: { title: string; schools: SchoolItem[] }) {
  if (schools.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      <div className="space-y-2">
        {schools.map((school, idx) => (
          <SchoolCard key={`${school.schoolName}-${idx}`} school={school} />
        ))}
      </div>
    </div>
  );
}

export function SchoolInfo({ schoolInfo }: SchoolInfoProps) {
  const hasData = schoolInfo && (
    schoolInfo.assignedElementary ||
    schoolInfo.nearbyMiddle.length > 0 ||
    schoolInfo.nearbyHigh.length > 0
  );

  if (!hasData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          학군 정보
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">학교 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        학군 정보
      </h2>

      <div className="space-y-4">
        {/* 배정 초등학교 */}
        {schoolInfo.assignedElementary && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              배정 초등학교
            </h3>
            <SchoolCard school={schoolInfo.assignedElementary} highlight />
          </div>
        )}

        {/* 중학군 정보 */}
        {schoolInfo.middleZoneName && (
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">중학군:</span>{' '}
              {schoolInfo.middleZoneName}
            </p>
          </div>
        )}

        {/* 가까운 중학교 */}
        <SchoolSection title="가까운 중학교" schools={schoolInfo.nearbyMiddle} />

        {/* 가까운 고등학교 */}
        <SchoolSection title="가까운 고등학교" schools={schoolInfo.nearbyHigh} />
      </div>
    </div>
  );
}
