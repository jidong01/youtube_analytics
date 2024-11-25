import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
  } from 'recharts';
  
  interface Video {
    publishedAt: string;
  }
  
  interface UploadPatternsProps {
    videos: Video[];
  }
  
  export default function UploadPatterns({ videos }: UploadPatternsProps) {
    // 요일별 업로드 수 계산
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayCount = videos.reduce((acc, video) => {
      const day = new Date(video.publishedAt).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  
    const dayData = dayNames.map((name, index) => ({
      name,
      count: dayCount[index] || 0
    }));
  
    // 시간대별 업로드 수 계산
    const hourCount = videos.reduce((acc, video) => {
      const hour = new Date(video.publishedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      name: `${i}시`,
      count: hourCount[i] || 0
    }));
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 text-gray-900">업로드 패턴 분석</h2>
        
        {/* 요일별 업로드 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">요일별 업로드 빈도</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="업로드 수" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* 시간대별 업로드 */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">시간대별 업로드 빈도</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" name="업로드 수" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  } 