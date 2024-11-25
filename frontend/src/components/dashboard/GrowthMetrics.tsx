interface Video {
    publishedAt: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
  }
  
  interface GrowthMetricsProps {
    videos: Video[];
  }
  
  export default function GrowthMetrics({ videos }: GrowthMetricsProps) {
    const calculateGrowth = () => {
      // 최근 30일과 이전 30일 데이터 분리
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentVideos = videos.filter(v => new Date(v.publishedAt) >= thirtyDaysAgo);
      const olderVideos = videos.filter(v => new Date(v.publishedAt) < thirtyDaysAgo);
  
      // 평균 조회수 계산
      const recentAvgViews = recentVideos.reduce((sum, video) => sum + parseInt(video.viewCount), 0) / (recentVideos.length || 1);
      const olderAvgViews = olderVideos.reduce((sum, video) => sum + parseInt(video.viewCount), 0) / (olderVideos.length || 1);
      
      // 평균 참여율 계산
      const calculateEngagement = (videos: Video[]) => {
        return videos.reduce((sum, video) => {
          const views = parseInt(video.viewCount) || 1;
          const engagement = (parseInt(video.likeCount) + parseInt(video.commentCount)) / views;
          return sum + engagement;
        }, 0) / (videos.length || 1);
      };
  
      const recentEngagement = calculateEngagement(recentVideos);
      const olderEngagement = calculateEngagement(olderVideos);
  
      return {
        viewGrowth: ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100,
        engagementGrowth: ((recentEngagement - olderEngagement) / olderEngagement) * 100
      };
    };
  
    const growth = calculateGrowth();
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">성장 지표 (최근 30일)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">조회수 성장률</h3>
            <p className={`text-2xl font-bold ${growth.viewGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.viewGrowth.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">참여율 성장률</h3>
            <p className={`text-2xl font-bold ${growth.engagementGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.engagementGrowth.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    );
  }