'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const extractChannelId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        if (urlObj.pathname.startsWith('/channel/')) {
          return urlObj.pathname.split('/')[2];
        } else if (urlObj.pathname.startsWith('/c/') || urlObj.pathname.startsWith('/@')) {
          return url; // 채널 커스텀 URL은 그대로 반환
        }
      }
      throw new Error();
    } catch {
      if (url.startsWith('UC') && url.length === 24) {
        return url;
      }
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const channelId = extractChannelId(channelUrl);
    if (!channelId) {
      setError('올바른 YouTube 채널 URL을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    router.push(`/dashboard?channelId=${encodeURIComponent(channelId)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            YouTube 채널 분석
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-700 mb-1">
                채널 URL 입력
              </label>
              <input
                type="text"
                id="channelUrl"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://www.youtube.com/channel/UC..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !channelUrl}
              className={`w-full py-2 px-4 rounded-md text-white font-medium
                ${isLoading || !channelUrl 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isLoading ? '분석 중...' : '분석하기'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">입력 가능한 형식:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>채널 URL (https://www.youtube.com/channel/UC...)</li>
              <li>채널 ID (UC...)</li>
              <li>커스텀 URL (https://www.youtube.com/@...)</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 