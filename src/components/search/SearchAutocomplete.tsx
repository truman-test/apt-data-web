'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { useAutocomplete } from '@/hooks/useApartment';
import type { AutocompleteItem } from '@/types/apartment';

interface SearchAutocompleteProps {
  initialValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  variant?: 'home' | 'header';
  className?: string;
}

export function SearchAutocomplete({
  initialValue = '',
  placeholder = '아파트명, 지역명으로 검색하세요',
  onSearch,
  variant = 'home',
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { data, isLoading } = useAutocomplete(debouncedValue);
  const items = data?.data || [];

  // 디바운스 처리 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // 자동완성 결과가 있으면 드롭다운 열기
  useEffect(() => {
    if (items.length > 0 && inputValue.length >= 1) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [items, inputValue]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // initialValue 변경 시 동기화
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // 검색 실행
  const handleSearch = useCallback(() => {
    const query = inputValue.trim();
    if (query.length >= 2) {
      setIsOpen(false);
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  }, [inputValue, onSearch, router]);

  // 아이템 선택 (상세 페이지로 이동)
  const handleSelectItem = useCallback((item: AutocompleteItem) => {
    setIsOpen(false);
    setInputValue(item.aptName);
    router.push(`/apt/${item.id}`);
  }, [router]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelectItem(items[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 선택된 아이템 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const isHomeVariant = variant === 'home';

  return (
    <div className={`relative ${className}`}>
      {/* 입력 필드 */}
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${
            isHomeVariant ? 'h-5 w-5' : 'h-4 w-4 left-3'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => items.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={
            isHomeVariant
              ? 'h-14 w-full rounded-full border border-gray-200 bg-white pl-12 pr-32 text-lg shadow-lg transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-800'
              : 'h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800'
          }
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
        />
        {isHomeVariant && (
          <button
            type="button"
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            검색
          </button>
        )}
      </div>

      {/* 자동완성 드롭다운 */}
      {isOpen && (
        <ul
          ref={listRef}
          id="autocomplete-list"
          role="listbox"
          className={`absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
            isHomeVariant ? 'left-0' : ''
          }`}
        >
          {isLoading ? (
            <li className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
              검색 중...
            </li>
          ) : items.length === 0 ? (
            <li className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다
            </li>
          ) : (
            items.map((item, index) => (
              <li
                key={item.id}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`cursor-pointer px-4 py-3 transition-colors ${
                  selectedIndex === index
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      <span className="text-blue-600 dark:text-blue-400">{item.dongName}</span>{' '}
                      {item.aptName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {item.sidoName} {item.sigunguName}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
