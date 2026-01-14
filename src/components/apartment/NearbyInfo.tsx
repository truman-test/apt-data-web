import { Train, Clock } from 'lucide-react';
import type { NearestStation } from '@/types/apartment';

interface NearbyInfoProps {
  station: NearestStation | null | undefined;
}

export function NearbyInfo({ station }: NearbyInfoProps) {
  if (!station) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">교통 정보</h2>
        <p className="text-sm text-gray-500">지하철역 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">교통 정보</h2>

      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Train className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">{station.stationName}역</p>
            <p className="mt-0.5 text-sm text-gray-500">{station.lineName}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                {station.distance.toLocaleString()}m
              </span>
              <span className="flex items-center gap-1 text-gray-600">
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
