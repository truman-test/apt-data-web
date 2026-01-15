import { Train, Clock } from 'lucide-react';
import type { NearestStation } from '@/types/apartment';

interface NearbyInfoProps {
  station: NearestStation | null | undefined;
}

export function NearbyInfo({ station }: NearbyInfoProps) {
  if (!station) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">교통 정보</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">지하철역 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">교통 정보</h2>

      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
            <Train className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {station.stationName.endsWith('역') ? station.stationName : `${station.stationName}역`}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{station.lineName}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {station.distance.toLocaleString()}m
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                도보 {station.walkingMinutes}분
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
