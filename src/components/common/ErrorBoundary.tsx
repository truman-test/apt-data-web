'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 컴포넌트 레벨 에러 바운더리
 * 특정 섹션에서 에러가 발생해도 전체 페이지가 중단되지 않도록 함
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
          <p className="mt-3 text-sm font-medium text-red-800 dark:text-red-300">
            이 섹션을 불러오는 중 문제가 발생했습니다
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * API 에러 전용 폴백 컴포넌트
 */
export function ApiErrorFallback({
  message = '데이터를 불러오는 중 오류가 발생했습니다',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800/50">
      <AlertTriangle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
      )}
    </div>
  );
}

/**
 * 차트 에러 전용 폴백 컴포넌트
 */
export function ChartErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
      <AlertTriangle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        차트를 표시할 수 없습니다
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
