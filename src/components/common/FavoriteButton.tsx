'use client';

import { Heart } from 'lucide-react';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useToastStore } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  aptId: number;
  aptName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function FavoriteButton({
  aptId,
  aptName,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const addToast = useToastStore((state) => state.addToast);
  const favorited = isFavorite(aptId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(aptId);

    if (favorited) {
      addToast(
        aptName
          ? `${aptName}이(가) 관심 목록에서 제거되었습니다`
          : '관심 목록에서 제거되었습니다',
        'info'
      );
    } else {
      addToast(
        aptName
          ? `${aptName}이(가) 관심 목록에 추가되었습니다`
          : '관심 목록에 추가되었습니다',
        'success'
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'rounded-full transition-colors',
        favorited
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-400 hover:bg-gray-100 hover:text-red-400',
        sizeClasses[size],
        className
      )}
      aria-label={favorited ? '관심 목록에서 제거' : '관심 목록에 추가'}
    >
      <Heart
        className={cn(iconSizes[size], favorited && 'fill-current')}
      />
    </button>
  );
}
