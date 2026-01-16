import { MapPin, Building2, Calendar, Home, Flame, LayoutGrid, Hammer } from 'lucide-react';
import type { Apartment } from '@/types/apartment';

interface ApartmentInfoProps {
  apartment: Apartment;
}

export function ApartmentInfo({ apartment }: ApartmentInfoProps) {
  const { kaptInfo } = apartment;

  const infoItems = [
    {
      icon: MapPin,
      label: '주소',
      value: apartment.address,
    },
    {
      icon: Calendar,
      label: '준공년도',
      value: apartment.constructedYear > 0 ? `${apartment.constructedYear}년` : '-',
    },
    {
      icon: Home,
      label: '세대수',
      value: apartment.totalUnits > 0 ? `${apartment.totalUnits.toLocaleString()}세대` : '-',
    },
    {
      icon: Building2,
      label: '동수',
      value: apartment.totalBuildings > 0 ? `${apartment.totalBuildings}개동` : '-',
    },
  ];

  // K-apt 추가 정보
  const kaptItems = [
    {
      icon: Flame,
      label: '난방방식',
      value: kaptInfo?.heatType,
    },
    {
      icon: LayoutGrid,
      label: '복도유형',
      value: kaptInfo?.hallwayType,
    },
    {
      icon: Hammer,
      label: '시공사',
      value: kaptInfo?.buildCompany,
    },
  ].filter((item) => item.value);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">기본 정보</h2>
      <dl className="space-y-4">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs text-gray-500 dark:text-gray-400">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{item.value}</dd>
            </div>
          </div>
        ))}
        {kaptItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs text-gray-500 dark:text-gray-400">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* 지역 태그 */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          {apartment.sidoName}
        </span>
        {apartment.sigunguName && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {apartment.sigunguName}
          </span>
        )}
        {apartment.dongName && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {apartment.dongName}
          </span>
        )}
      </div>
    </div>
  );
}
