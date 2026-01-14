'use client';

import { cn } from '@/lib/utils';
import type { AreaType } from '@/types/apartment';

interface AreaFilterProps {
  areas: AreaType[];
  selected: number | null;
  onChange: (area: number | null) => void;
  isLoading?: boolean;
}

export function AreaFilter({ areas, selected, onChange, isLoading }: AreaFilterProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-16 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (areas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          selected === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        전체
      </button>
      {areas.map((area) => (
        <button
          key={area.id}
          onClick={() => onChange(area.exclusiveArea)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            selected !== null && Math.abs(selected - area.exclusiveArea) < 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {area.pyeong}평
          <span className="ml-1 text-xs opacity-70">
            ({area.exclusiveArea.toFixed(0)}㎡)
          </span>
        </button>
      ))}
    </div>
  );
}
