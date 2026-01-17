'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link, Copy, Check, MessageCircle } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';

interface ShareButtonProps {
  url?: string;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

// Web Share API 지원 여부 확인
function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// 카카오톡 공유 URL 생성
function createKakaoShareUrl(url: string, title: string): string {
  const text = encodeURIComponent(`${title}\n${url}`);
  return `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(url)}&text=${text}`;
}

export function ShareButton({
  url,
  title,
  description,
  size = 'md',
  variant = 'icon',
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addToast = useToastStore((state) => state.addToast);

  // 현재 URL 사용 (서버 사이드에서는 빈 문자열)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // URL 복사
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('링크가 복사되었습니다', 'success');
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch {
      addToast('링크 복사에 실패했습니다', 'error');
    }
  };

  // 네이티브 공유 (모바일)
  const handleNativeShare = async () => {
    if (!canUseWebShare()) return;

    try {
      await navigator.share({
        title,
        text: description || title,
        url: shareUrl,
      });
      setIsOpen(false);
    } catch (error) {
      // 사용자가 취소한 경우 무시
      if ((error as Error).name !== 'AbortError') {
        addToast('공유에 실패했습니다', 'error');
      }
    }
  };

  // 카카오톡 공유
  const handleKakaoShare = () => {
    const kakaoUrl = createKakaoShareUrl(shareUrl, title);
    window.open(kakaoUrl, '_blank', 'width=500,height=600');
    setIsOpen(false);
  };

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    // 모바일에서 네이티브 공유 지원 시 바로 실행
    if (canUseWebShare()) {
      handleNativeShare();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 공유 버튼 */}
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleButtonClick}
          className={`btn-press flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${sizeClasses[size]}`}
          aria-label="공유하기"
        >
          <Share2 className={iconSizes[size]} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleButtonClick}
          className="btn-press flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Share2 className="h-4 w-4" />
          공유하기
        </button>
      )}

      {/* 드롭다운 메뉴 (데스크톱) */}
      {isOpen && !canUseWebShare() && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* URL 복사 */}
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Link className="h-4 w-4" />
            )}
            {copied ? '복사됨!' : '링크 복사'}
          </button>

          {/* 카카오톡 공유 */}
          <button
            type="button"
            onClick={handleKakaoShare}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <MessageCircle className="h-4 w-4 text-yellow-500" />
            카카오톡 공유
          </button>
        </div>
      )}
    </div>
  );
}

// 간단한 복사 버튼 (인라인 사용)
export function CopyLinkButton({ url, className = '' }: { url?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((state) => state.addToast);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('링크가 복사되었습니다', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('링크 복사에 실패했습니다', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn-press flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          링크 복사
        </>
      )}
    </button>
  );
}
