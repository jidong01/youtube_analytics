import { useEffect, useState, useMemo } from 'react';
import { getChartAnalysis } from '@/lib/api';

interface Video {
  title: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  width: number;
  height: number;
}

interface ContentPerformanceProps {
  videos: Video[];
}

type VideoCategory = 'shorts' | 'short' | 'medium' | 'long';

interface CategoryStats {
  avgViews: number;
  avgEngagement: number;
  count: number;
  verticalCount: number;
  avgDuration: number;
}

// ISO 8601 duration을 초 단위로 변환하는 함수
const parseDuration = (duration: string): number => {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  const seconds = parseInt(matches[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

// 종횡비 계산 함수 추가
const isVerticalVideo = (width: number, height: number): boolean => {
  const aspectRatio = width / height;
  return aspectRatio < 1; // 세로형 비디오 (9:16 비율은 약 0.5625)
};

export default function ContentPerformance({ videos }: ContentPerformanceProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [filteredCount, setFilteredCount] = useState<number>(0);
  
  // useMemo를 사용하여 stats 계산
  const stats = useMemo(() => {
    const validVideos = videos.filter(video => parseInt(video.viewCount) > 0);
    setFilteredCount(videos.length - validVideos.length);

    const categorizeVideos = (videos: Video[]) => {
      return videos.reduce((acc, video) => {
        const duration = video.duration ? parseDuration(video.duration) : 0;
        
        // 숏폼 조건: 세로형(9:16 비율)이면서 60초 이하
        const isShortForm = isVerticalVideo(video.width, video.height) && duration <= 60;
        
        if (isShortForm) {
          acc.shorts.push(video);
        } else {
          // 일반 영상 분류 (숏폼이 아닌 경우)
          const category = duration < 600 ? 'short' : duration < 1200 ? 'medium' : 'long';
          acc[category].push(video);
        }
        
        return acc;
      }, { shorts: [], short: [], medium: [], long: [] } as Record<VideoCategory, Video[]>);
    };

    const calculateStats = (videos: Video[]): CategoryStats => {
      if (videos.length === 0) {
        return { 
          avgViews: 0, 
          avgEngagement: 0, 
          count: 0,
          verticalCount: 0,
          avgDuration: 0
        };
      }

      const totalViews = videos.reduce((sum, v) => sum + parseInt(v.viewCount), 0);
      const totalDuration = videos.reduce((sum, v) => sum + parseDuration(v.duration), 0);
      const verticalCount = videos.filter(v => isVerticalVideo(v.width, v.height)).length;
      
      const avgViews = totalViews / videos.length;
      const avgDuration = totalDuration / videos.length;
      const avgEngagement = videos.reduce((sum, v) => {
        const views = parseInt(v.viewCount);
        const engagement = (parseInt(v.likeCount) + parseInt(v.commentCount)) / views;
        return sum + engagement;
      }, 0) / videos.length;

      return { 
        avgViews, 
        avgEngagement, 
        count: videos.length,
        verticalCount,
        avgDuration
      };
    };

    const categorizedVideos = categorizeVideos(validVideos);
    
    return {
      shorts: calculateStats(categorizedVideos.shorts),
      short: calculateStats(categorizedVideos.short),
      medium: calculateStats(categorizedVideos.medium),
      long: calculateStats(categorizedVideos.long),
    };
  }, [videos]); // videos가 변경될 때만 재계산

  // filteredCount 설정을 useEffect로 이동
  useEffect(() => {
    const validVideosCount = videos.filter(video => parseInt(video.viewCount) > 0).length;
    setFilteredCount(videos.length - validVideosCount);
  }, [videos]);

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const categories = ['shorts', 'short', 'medium', 'long'] as const;
        const bestCategory = categories.reduce((best, current) => {
          return stats[current].avgViews > stats[best].avgViews ? current : best;
        }, categories[0]);

        const categoryNames = {
          shorts: '쇼츠',
          short: '10분 미만',
          medium: '10-20분',
          long: '20분 이상'
        };

        const analysisResult = await getChartAnalysis('content_performance', {
          best_duration: categoryNames[bestCategory],
          best_views: Math.round(stats[bestCategory].avgViews),
          best_engagement: (stats[bestCategory].avgEngagement * 100).toFixed(1),
          shorts_views: Math.round(stats.shorts.avgViews),
          short_views: Math.round(stats.short.avgViews),
          medium_views: Math.round(stats.medium.avgViews),
          long_views: Math.round(stats.long.avgViews)
        });
        
        setAnalysis(analysisResult);
      } catch (error) {
        console.error('Error getting analysis:', error);
      }
    };

    getAnalysis();
  }, [stats]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">콘텐츠 성과 분석</h2>
      
      {/* AI 분석 결과 */}
      {analysis && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800">{analysis}</p>
              {filteredCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  * 조회수가 0인 {filteredCount}개의 영상은 분석에서 제외되었습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 숏폼 성과 */}
      {stats.shorts.count > 0 && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">
            숏폼 성과 (60초 이하 세로형)
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xl font-semibold text-purple-900">
                {Math.round(stats.shorts.avgViews).toLocaleString()}
              </p>
              <p className="text-sm text-purple-700">평균 조회수</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-purple-900">
                {(stats.shorts.avgEngagement * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-purple-700">평균 참여율</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-purple-900">
                {Math.round(stats.shorts.avgDuration)}초
              </p>
              <p className="text-sm text-purple-700">평균 길이</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-purple-900">
                {stats.shorts.count}
              </p>
              <p className="text-sm text-purple-700">총 영상 수</p>
            </div>
          </div>
        </div>
      )}

      {/* 일반 영상 성과 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">10분 미만 영상</h3>
          <p className="text-xl font-semibold">{Math.round(stats.short.avgViews).toLocaleString()} </p>
          <p className="text-sm text-gray-500">
            {(stats.short.avgEngagement * 100).toFixed(1)}% 참여율
            <span className="text-xs text-gray-400 block mt-1">
              {stats.short.count}개 영상
            </span>
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">10-20분 영상</h3>
          <p className="text-xl font-semibold">{Math.round(stats.medium.avgViews).toLocaleString()} </p>
          <p className="text-sm text-gray-500">
            {(stats.medium.avgEngagement * 100).toFixed(1)}% 참여율
            <span className="text-xs text-gray-400 block mt-1">
              {stats.medium.count}개 영상
            </span>
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">20분 이상 영상</h3>
          <p className="text-xl font-semibold">{Math.round(stats.long.avgViews).toLocaleString()} </p>
          <p className="text-sm text-gray-500">
            {(stats.long.avgEngagement * 100).toFixed(1)}% 참여율
            <span className="text-xs text-gray-400 block mt-1">
              {stats.long.count}개 영상
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
