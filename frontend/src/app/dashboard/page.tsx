'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getChannelInfo, getChannelVideos } from '@/lib/api';
import VideoList from '@/components/dashboard/VideoList';
import StatsChart from '@/components/dashboard/StatsChart';
import TopVideos from '@/components/dashboard/TopVideos';
import UploadPatterns from '@/components/dashboard/UploadPatterns';
import EngagementAnalysis from '@/components/dashboard/EngagementAnalysis';
import GrowthMetrics from '@/components/dashboard/GrowthMetrics';
import ContentPerformance from '@/components/dashboard/ContentPerformance';
import TitleAnalysis from '@/components/dashboard/TitleAnalysis';
import CoreFansAnalysis from '@/components/dashboard/CoreFansAnalysis';

interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  thumbnail: string;
  customUrl: string;
  publishedAt: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const channelId = searchParams.get('channelId');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!channelId) return;
      
      try {
        setIsLoading(true);
        const [channelData, videosData] = await Promise.all([
          getChannelInfo(channelId),
          getChannelVideos(channelId)
        ]);
        
        setChannelInfo(channelData);
        setVideos(videosData);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [channelId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div className="text-xl font-semibold">채널 데이터를 분석하고 있습니다</div>
            <div className="text-sm text-gray-500 text-center">
              채널의 모든 영상 정보를 가져오고 있습니다.<br />
              채널 크기에 따라 시간이 걸릴 수 있습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-red-500 text-center">
            <div className="text-xl font-semibold mb-2">오류가 발생했습니다</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!channelInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-xl text-center">채널 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {channelInfo?.thumbnail && (
                <img 
                  src={channelInfo.thumbnail} 
                  alt={channelInfo.title}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <h1 className="text-lg font-semibold text-gray-900">{channelInfo?.title}</h1>
            </div>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">구독자</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {parseInt(channelInfo?.subscriberCount || '0').toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">총 조회수</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {parseInt(channelInfo?.viewCount || '0').toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">동영상 수</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {parseInt(channelInfo?.videoCount || '0').toLocaleString()}
            </p>
          </div>
        </div>

        {/* 성장 지표 */}
        {videos.length > 0 && (
          <div className="mb-6">
            <GrowthMetrics videos={videos} />
          </div>
        )}

        {/* 첫 번째 행: 조회수 추이 + 참여율 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {videos.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">조회수 추이</h2>
                <StatsChart videos={videos.map(video => ({
                  date: video.publishedAt,
                  views: parseInt(video.viewCount),
                  title: video.title
                }))} />
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">참여율 분석</h2>
                <EngagementAnalysis videos={videos} />
              </div>
            </div>
          )}
        </div>

        {/* 두 번째 행: 콘텐츠 성과 분석 + 제목 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {videos.length > 0 && (
            <ContentPerformance videos={videos} />
          )}
          {videos.length > 0 && (
            <TitleAnalysis videos={videos} />
          )}
        </div>

        {/* 세 번째 행: 업로드 패턴 + 인기 동영상 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {videos.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">업로드 패턴</h2>
                <UploadPatterns videos={videos} />
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 동영상 TOP 10</h2>
                <TopVideos videos={videos} />
              </div>
            </div>
          )}
        </div>

        {/* 핵심 팬 분석 섹션 */}
        {channelInfo && (
          <div className="mb-6">
            <CoreFansAnalysis channelId={channelInfo.id} channelTitle={channelInfo.title} />
          </div>
        )}

        {/* 마지막 행: 전체 동영상 목록 */}
        {videos.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">전체 동영상</h2>
              <VideoList videos={videos} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 