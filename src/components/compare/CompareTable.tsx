import { Building2, Calendar, Home, MapPin, Train } from 'lucide-react';
import type { Apartment, NearestStation } from '@/types/apartment';

interface CompareTableProps {
  apartments: Apartment[];
  stations: (NearestStation | null)[];
}

interface CompareRow {
  label: string;
  icon: React.ReactNode;
  values: (string | number)[];
}

export function CompareTable({ apartments, stations }: CompareTableProps) {
  const rows: CompareRow[] = [
    {
      label: '주소',
      icon: <MapPin className="h-4 w-4" />,
      values: apartments.map((apt) => apt.address || '-'),
    },
    {
      label: '준공년도',
      icon: <Calendar className="h-4 w-4" />,
      values: apartments.map((apt) =>
        apt.constructedYear > 0 ? `${apt.constructedYear}년` : '-'
      ),
    },
    {
      label: '총 세대수',
      icon: <Home className="h-4 w-4" />,
      values: apartments.map((apt) =>
        apt.totalUnits > 0 ? `${apt.totalUnits.toLocaleString()}세대` : '-'
      ),
    },
    {
      label: '총 동수',
      icon: <Building2 className="h-4 w-4" />,
      values: apartments.map((apt) =>
        apt.totalBuildings > 0 ? `${apt.totalBuildings}개동` : '-'
      ),
    },
    {
      label: '지하철역',
      icon: <Train className="h-4 w-4" />,
      values: stations.map((station) =>
        station ? `${station.stationName}역 (${station.distance}m)` : '-'
      ),
    },
    {
      label: '도보 시간',
      icon: <Train className="h-4 w-4" />,
      values: stations.map((station) =>
        station ? `${station.walkingMinutes}분` : '-'
      ),
    },
  ];

  // 건축 연령 계산
  const currentYear = new Date().getFullYear();
  const ageRow: CompareRow = {
    label: '건축 연령',
    icon: <Calendar className="h-4 w-4" />,
    values: apartments.map((apt) =>
      apt.constructedYear > 0
        ? `${currentYear - apt.constructedYear}년`
        : '-'
    ),
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">기본 정보 비교</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 pr-4 text-left font-medium text-gray-500 dark:text-gray-400">항목</th>
              {apartments.map((apt) => (
                <th
                  key={apt.id}
                  className="min-w-[150px] pb-3 text-left font-semibold text-gray-900 dark:text-white"
                >
                  {apt.aptName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...rows.slice(0, 2), ageRow, ...rows.slice(2)].map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {row.icon}
                    <span>{row.label}</span>
                  </div>
                </td>
                {row.values.map((value, i) => (
                  <td key={i} className="py-3 text-gray-900 dark:text-white">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
