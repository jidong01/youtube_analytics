interface Video {
    title: string;
    viewCount: string;
  }
  
  interface TitleAnalysisProps {
    videos: Video[];
  }
  
  export default function TitleAnalysis({ videos }: TitleAnalysisProps) {
    const analyzeTitles = () => {
      // 제목 길이별 성과
      const lengthPerformance = videos.reduce((acc, video) => {
        const length = video.title.length;
        const category = length < 20 ? 'short' : length < 40 ? 'medium' : 'long';
        
        if (!acc[category]) {
          acc[category] = { count: 0, totalViews: 0 };
        }
        
        acc[category].count++;
        acc[category].totalViews += parseInt(video.viewCount);
        
        return acc;
      }, {} as Record<string, { count: number; totalViews: number }>);
  
      // 키워드 분석
      const keywords = videos.reduce((acc, video) => {
        const words = video.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length < 2) return; // 짧은 단어 제외
          
          if (!acc[word]) {
            acc[word] = { count: 0, totalViews: 0 };
          }
          
          acc[word].count++;
          acc[word].totalViews += parseInt(video.viewCount);
        });
        
        return acc;
      }, {} as Record<string, { count: number; totalViews: number }>);
  
      // 상위 키워드 추출
      const topKeywords = Object.entries(keywords)
        .sort((a, b) => b[1].totalViews - a[1].totalViews)
        .slice(0, 5);
  
      return { lengthPerformance, topKeywords };
    };
  
    const analysis = analyzeTitles();
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">제목 분석</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">제목 길이별 평균 조회수</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(analysis.lengthPerformance).map(([length, stats]) => (
                <div key={length} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    {length === 'short' ? '20자 미만' : length === 'medium' ? '20-40자' : '40자 이상'}
                  </h4>
                  <p className="text-xl font-semibold">
                    {Math.round(stats.totalViews / stats.count).toLocaleString()} 
                  </p>
                  <p className="text-sm text-gray-500">{stats.count}개 영상</p>
                </div>
              ))}
            </div>
          </div>
  
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">키워드별 평균 조회수</h3>
            <div className="grid grid-cols-5 gap-4">
              {analysis.topKeywords.map(([keyword, stats]) => (
                <div key={keyword} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">{keyword}</h4>
                  <p className="text-lg font-semibold">
                    {Math.round(stats.totalViews / stats.count).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{stats.count}회 사용</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } 