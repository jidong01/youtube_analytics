'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChannelInput() {
  const [channelId, setChannelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 채널 ID 유효성 검사 (간단한 예시)
      if (!channelId.trim()) {
        throw new Error('채널 ID를 입력해주세요.');
      }

      // 대시보드 페이지로 이동
      router.push(`/dashboard?channelId=${channelId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channelId" className="block text-sm font-medium text-gray-700">
            YouTube 채널 ID
          </label>
          <input
            type="text"
            id="channelId"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="채널 ID를 입력하세요"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? '로딩중...' : '분석 시작'}
        </button>
      </form>
    </div>
  );
} 