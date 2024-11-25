import { useEffect, useState } from 'react';
import { getChartAnalysis } from '@/lib/api';

interface Video {
  title: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
}

interface ContentPerformanceProps {
  videos: Video[];
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

export default function ContentPerformance({ videos }: ContentPerformanceProps) {
  const [analysis, setAnalysis] = useState<string>('');
  
  const analyzeContent = () => {
    const categorizeVideos = (videos: Video[]) => {
      return videos.reduce((acc, video) => {
        // 영상 길이 기준으로 분류 (duration이 있다고 가정)
        const duration = video.duration ? parseDuration(video.duration) : 0;
        const category = duration < 600 ? 'short' : duration < 1200 ? 'medium' : 'long';
        
        acc[category].push(video);
        return acc;
      }, { short: [], medium: [], long: [] } as Record<string, Video[]>);
    };

    const calculateStats = (videos: Video[]) => {
      const totalViews = videos.reduce((sum, v) => sum + parseInt(v.viewCount), 0);
      const avgViews = totalViews / (videos.length || 1);
      const avgEngagement = videos.reduce((sum, v) => {
        return sum + (parseInt(v.likeCount) + parseInt(v.commentCount)) / parseInt(v.viewCount);
      }, 0) / (videos.length || 1);

      return { avgViews, avgEngagement };
    };

    const categorizedVideos = categorizeVideos(videos);
    
    return {
      short: calculateStats(categorizedVideos.short),
      medium: calculateStats(categorizedVideos.medium),
      long: calculateStats(categorizedVideos.long),
    };
  };

  const stats = analyzeContent();

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        // 가장 성과가 좋은 길이 카테고리 찾기
        const categories = ['short', 'medium', 'long'] as const;
        const bestCategory = categories.reduce((best, current) => {
          return stats[current].avgViews > stats[best].avgViews ? current : best;
        }, categories[0]);

        const categoryNames = {
          short: '10분 미만',
          medium: '10-20분',
          long: '20분 이상'
        };

        const analysisResult = await getChartAnalysis('content_performance', {
          best_duration: categoryNames[bestCategory],
          best_views: Math.round(stats[bestCategory].avgViews),
          best_engagement: (stats[bestCategory].avgEngagement * 100).toFixed(1),
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
            <p className="text-sm text-blue-800">{analysis}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-2">10분 미만 영상</h3>
            <p className="text-xl font-semibold">{Math.round(stats.short.avgViews).toLocaleString()} </p>
            <p className="text-sm text-gray-500">{(stats.short.avgEngagement * 100).toFixed(1)}% 참여율</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-2">10-20분 영상</h3>
            <p className="text-xl font-semibold">{Math.round(stats.medium.avgViews).toLocaleString()} </p>
            <p className="text-sm text-gray-500">{(stats.medium.avgEngagement * 100).toFixed(1)}% 참여율</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-2">20분 이상 영상</h3>
            <p className="text-xl font-semibold">{Math.round(stats.long.avgViews).toLocaleString()} </p>
            <p className="text-sm text-gray-500">{(stats.long.avgEngagement * 100).toFixed(1)}% 참여율</p>
          </div>
        </div>
      </div>
    </div>
  );
}
