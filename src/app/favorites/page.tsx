'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useApartment } from '@/hooks/useApartment';
import { ApartmentCard } from '@/components/search/ApartmentCard';
import { ApartmentCardSkeleton } from '@/components/skeleton';
import type { Apartment } from '@/types/apartment';

function FavoriteApartmentCard({ aptId }: { aptId: number }) {
  const { data, isLoading, isError } = useApartment(aptId);
  const apartment = data?.data;

  if (isLoading) {
    return <ApartmentCardSkeleton />;
  }

  if (isError || !apartment) {
    return null;
  }

  return <ApartmentCard apartment={apartment} />;
}

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const favorites = useFavoriteStore((state) => state.favorites);

  // Hydration mismatch 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">관심 단지</h1>
          {mounted && favorites.length > 0 && (
            <span className="ml-auto text-sm text-gray-500">
              {favorites.length}개
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {!mounted ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ApartmentCardSkeleton key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">관심 단지가 없습니다</p>
            <p className="mt-1 text-sm text-gray-400">
              마음에 드는 아파트에 하트를 눌러 저장하세요
            </p>
            <Link
              href="/"
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              아파트 검색하기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favorites.map((aptId) => (
              <FavoriteApartmentCard key={aptId} aptId={aptId} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
