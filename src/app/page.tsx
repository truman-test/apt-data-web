'use client';

import { useState } from 'react';
import { Search, MapPin, TrendingUp, School, Train } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            아파트시세
          </Link>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/map" className="hover:text-blue-600">
              지도검색
            </Link>
            <Link href="/ranking" className="hover:text-blue-600">
              시세랭킹
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-4">
        <section className="flex flex-col items-center py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            전국 아파트 실거래가
            <br />
            <span className="text-blue-600">한눈에</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            2,200만 건의 실거래가 데이터로 정확한 시세를 확인하세요
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아파트명, 지역명으로 검색하세요"
                className="h-14 w-full rounded-full border border-gray-200 bg-white pl-12 pr-32 text-lg shadow-lg transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                검색
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['서울', '경기', '인천', '부산', '대구'].map((region) => (
              <Link
                key={region}
                href={`/search?q=${region}`}
                className="rounded-full bg-white px-4 py-1.5 text-sm text-gray-600 shadow transition-colors hover:bg-gray-50"
              >
                {region}
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-6 pb-20 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="실거래가 분석"
            description="2006년부터 현재까지 모든 매매/전월세 거래"
          />
          <FeatureCard
            icon={<MapPin className="h-6 w-6" />}
            title="지도 검색"
            description="44,571개 단지 위치 정보 제공"
          />
          <FeatureCard
            icon={<School className="h-6 w-6" />}
            title="학군 정보"
            description="주변 학교 및 학업성취도 정보"
          />
          <FeatureCard
            icon={<Train className="h-6 w-6" />}
            title="교통 정보"
            description="최근접 지하철역 및 도보 거리"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p>데이터 출처: 국토교통부 실거래가 공개시스템, K-apt, NEIS</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600">{icon}</div>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
