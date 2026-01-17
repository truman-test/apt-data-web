'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice, formatChartPrice } from '@/lib/formatters';

interface PriceChangeProps {
  /** 현재 가격 (만원) */
  current: number;
  /** 이전 가격 (만원) */
  previous: number;
  /** 표시 형식 */
  variant?: 'full' | 'compact' | 'badge';
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  /** 가격 표시 여부 (false면 변동률만 표시) */
  showPrice?: boolean;
}

/**
 * 가격 변동 표시 컴포넌트
 * - 상승: 빨간색 (▲)
 * - 하락: 파란색 (▼)
 * - 보합: 회색 (-)
 */
export function PriceChange({
  current,
  previous,
  variant = 'full',
  showIcon = true,
  showPrice = false,
}: PriceChangeProps) {
  if (previous === 0) {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }

  const diff = current - previous;
  const percent = ((diff / previous) * 100).toFixed(1);
  const absPercent = Math.abs(parseFloat(percent));

  // 보합 (1% 미만 변동)
  if (absPercent < 0.1) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
        {showIcon && <Minus className="h-3.5 w-3.5" />}
        <span>보합</span>
      </span>
    );
  }

  const isUp = diff > 0;
  const colorClass = isUp
    ? 'text-red-500 dark:text-red-400'
    : 'text-blue-500 dark:text-blue-400';

  const Icon = isUp ? TrendingUp : TrendingDown;
  const arrow = isUp ? '▲' : '▼';

  if (variant === 'badge') {
    const bgClass = isUp
      ? 'bg-red-50 dark:bg-red-900/30'
      : 'bg-blue-50 dark:bg-blue-900/30';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${bgClass} ${colorClass}`}
      >
        {showIcon && <Icon className="h-3 w-3" />}
        <span>
          {arrow} {absPercent}%
        </span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-0.5 text-sm ${colorClass}`}>
        <span>{arrow}</span>
        <span>{absPercent}%</span>
      </span>
    );
  }

  // variant === 'full'
  return (
    <span className={`inline-flex items-center gap-1 ${colorClass}`}>
      {showIcon && <Icon className="h-4 w-4" />}
      <span className="font-medium">
        {arrow} {absPercent}%
        {showPrice && (
          <span className="ml-1 text-sm">
            ({isUp ? '+' : ''}{formatChartPrice(diff)})
          </span>
        )}
      </span>
    </span>
  );
}

interface PriceWithChangeProps {
  /** 현재 가격 (만원) */
  price: number;
  /** 이전 가격 (만원, 비교 기준) */
  previousPrice?: number;
  /** 가격 표시 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 가격 + 변동률 함께 표시
 */
export function PriceWithChange({
  price,
  previousPrice,
  size = 'md',
}: PriceWithChangeProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-col">
      <span className={`font-bold text-gray-900 dark:text-white ${sizeClasses[size]}`}>
        {formatPrice(price)}
      </span>
      {previousPrice !== undefined && previousPrice > 0 && (
        <PriceChange
          current={price}
          previous={previousPrice}
          variant="compact"
          showIcon={false}
        />
      )}
    </div>
  );
}
