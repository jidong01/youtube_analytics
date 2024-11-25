import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
  } from 'recharts';
  
  interface VideoStats {
    date: string;
    views: number;
    title: string;
  }
  
  interface StatsChartProps {
    videos: VideoStats[];
  }
  
  export default function StatsChart({ videos }: StatsChartProps) {
    // 날짜별로 데이터 정렬
    const sortedData = [...videos].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  
    // 이동 평균 계산 (7일)
    const movingAverageData = sortedData.map((item, index) => {
      const start = Math.max(0, index - 3);
      const end = Math.min(sortedData.length, index + 4);
      const subset = sortedData.slice(start, end);
      const average = subset.reduce((sum, curr) => sum + curr.views, 0) / subset.length;
  
      return {
        ...item,
        movingAverage: Math.round(average)
      };
    });
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={movingAverageData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric'
                })}
                stroke="#666"
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                stroke="#666"
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                formatter={(value: number) => [
                  `${value.toLocaleString()}회`,
                  '조회수'
                ]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#8884d8"
                strokeWidth={2}
                fill="url(#colorViews)"
                name="조회수"
              />
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={false}
                name="7일 이동평균"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          * 영상 업로드 날짜 기준, 7일 이동평균 포함
        </div>
      </div>
    );
  } 