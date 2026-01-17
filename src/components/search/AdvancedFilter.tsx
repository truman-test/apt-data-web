'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { SearchFilters } from '@/types/apartment';

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

const YEAR_OPTIONS: FilterOption<NonNullable<SearchFilters['yearBuilt']>>[] = [
  { value: '~1990', label: '1990년 이전' },
  { value: '1990s', label: '1990년대' },
  { value: '2000s', label: '2000년대' },
  { value: '2010s', label: '2010년대' },
  { value: '2020~', label: '2020년 이후' },
];

const UNITS_OPTIONS: FilterOption<NonNullable<SearchFilters['units']>>[] = [
  { value: '~100', label: '100세대 미만' },
  { value: '100~300', label: '100~300세대' },
  { value: '300~500', label: '300~500세대' },
  { value: '500~1000', label: '500~1000세대' },
  { value: '1000~2000', label: '1000~2000세대' },
  { value: '2000~', label: '2000세대 이상' },
];

const HALLWAY_OPTIONS: FilterOption<NonNullable<SearchFilters['hallwayType']>>[] = [
  { value: '계단식', label: '계단식' },
  { value: '복도식', label: '복도식' },
  { value: '혼합식', label: '혼합식' },
];

interface AdvancedFilterProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

function FilterChip<T extends string>({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (value: T | undefined) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(selected ? undefined : value)}
      className={`btn-press rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: FilterOption<T>[];
  selected: T | undefined;
  onSelect: (value: T | undefined) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            value={option.value}
            selected={selected === option.value}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function AdvancedFilter({ filters, onChange }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 활성 필터 개수
  const activeCount = [filters.yearBuilt, filters.units, filters.hallwayType].filter(Boolean).length;

  // 필터 초기화
  const handleClear = () => {
    onChange({});
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 - 토글 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">상세 필터</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 필터 내용 */}
      {isOpen && (
        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          <div className="space-y-4">
            {/* 준공 연도 */}
            <FilterSection
              title="준공 연도"
              options={YEAR_OPTIONS}
              selected={filters.yearBuilt}
              onSelect={(value) => onChange({ ...filters, yearBuilt: value })}
            />

            {/* 세대수 */}
            <FilterSection
              title="세대수"
              options={UNITS_OPTIONS}
              selected={filters.units}
              onSelect={(value) => onChange({ ...filters, units: value })}
            />

            {/* 복도 유형 */}
            <FilterSection
              title="복도 유형"
              options={HALLWAY_OPTIONS}
              selected={filters.hallwayType}
              onSelect={(value) => onChange({ ...filters, hallwayType: value })}
            />
          </div>

          {/* 필터 초기화 버튼 */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
              필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 활성 필터 요약 (접혀있을 때) */}
      {!isOpen && activeCount > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          {filters.yearBuilt && (
            <ActiveFilterBadge
              label={YEAR_OPTIONS.find((o) => o.value === filters.yearBuilt)?.label || ''}
              onRemove={() => onChange({ ...filters, yearBuilt: undefined })}
            />
          )}
          {filters.units && (
            <ActiveFilterBadge
              label={UNITS_OPTIONS.find((o) => o.value === filters.units)?.label || ''}
              onRemove={() => onChange({ ...filters, units: undefined })}
            />
          )}
          {filters.hallwayType && (
            <ActiveFilterBadge
              label={filters.hallwayType}
              onRemove={() => onChange({ ...filters, hallwayType: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ActiveFilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-sm text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
      {label}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
