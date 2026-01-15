import Link from 'next/link';
import { MapPin, Building2, Calendar } from 'lucide-react';
import type { Apartment } from '@/types/apartment';
import { FavoriteButton } from '@/components/common/FavoriteButton';

interface ApartmentCardProps {
  apartment: Apartment;
}

export function ApartmentCard({ apartment }: ApartmentCardProps) {
  return (
    <Link
      href={`/apt/${apartment.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
    >
      <div className="flex justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* 단지명 */}
          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {apartment.aptName}
          </h3>

          {/* 주소 */}
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{apartment.address}</span>
          </div>

          {/* 상세 정보 */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            {apartment.constructedYear > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <span>{apartment.constructedYear}년</span>
              </div>
            )}
            {apartment.totalUnits > 0 && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <span>{apartment.totalUnits.toLocaleString()}세대</span>
              </div>
            )}
          </div>
        </div>

        {/* 지역 뱃지 + 즐겨찾기 */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {apartment.sidoName}
            </span>
            <FavoriteButton
              aptId={apartment.id}
              aptName={apartment.aptName}
              size="sm"
            />
          </div>
          {apartment.sigunguName && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {apartment.sigunguName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
