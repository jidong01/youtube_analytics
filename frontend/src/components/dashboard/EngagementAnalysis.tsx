import { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { getChartAnalysis } from '../../lib/api';

interface Video {
  title: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  publishedAt: string;
}

interface EngagementAnalysisProps {
  videos: Video[];
}

export default function EngagementAnalysis({ videos }: EngagementAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'scatter' | 'trend'>('trend');
  const [analysis, setAnalysis] = useState<string>('');

  // 참여율 데이터 계산
  const engagementData = videos.map(video => {
    const views = parseInt(video.viewCount);
    const likes = parseInt(video.likeCount);
    const comments = parseInt(video.commentCount);
    
    return {
      title: video.title,
      views,
      likeRatio: (likes / views) * 100,
      commentRatio: (comments / views) * 100,
      totalEngagement: ((likes + comments) / views) * 100
    };
  });

  // 평균 참여율 계산
  const averageEngagement = {
    likeRatio: engagementData.reduce((sum, video) => sum + video.likeRatio, 0) / videos.length,
    commentRatio: engagementData.reduce((sum, video) => sum + video.commentRatio, 0) / videos.length,
    totalEngagement: engagementData.reduce((sum, video) => sum + video.totalEngagement, 0) / videos.length
  };

  // 시간에 따른 참여율 데이터 계산
  const trendData = videos
    .map(video => ({
      date: new Date(video.publishedAt),
      title: video.title,
      engagement: ((parseInt(video.likeCount) + parseInt(video.commentCount)) / parseInt(video.viewCount)) * 100
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(item => ({
      ...item,
      date: new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(item.date).replace(/\. /g, '-').replace('.', '')
    }));

  const formatXAxis = (tickItem: string) => {
    return tickItem;
  };

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const analysisResult = await getChartAnalysis('engagement', {
          like_ratio: averageEngagement.likeRatio,
          comment_ratio: averageEngagement.commentRatio,
          total_engagement: averageEngagement.totalEngagement
        });
        setAnalysis(analysisResult);
      } catch (error) {
        console.error('Error getting analysis:', error);
      }
    };

    getAnalysis();
  }, [averageEngagement]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* 분석 내용 추가 */}
      {analysis && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">{analysis}</p>
          </div>
        </div>
      )}
      
      {/* 평균 참여율 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900">평균 좋아요 비율</h3>
          <p className="text-2xl font-bold text-gray-900">
            {averageEngagement.likeRatio.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900">평균 댓글 비율</h3>
          <p className="text-2xl font-bold text-gray-900">
            {averageEngagement.commentRatio.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900">평균 총 참여율</h3>
          <p className="text-2xl font-bold text-gray-900">
            {averageEngagement.totalEngagement.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* 탭 선택 */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'trend' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('trend')}
        >
          참여율 추이
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'scatter' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('scatter')}
        >
          참여율 분포
        </button>
      </div>

      {/* 차트 영역 */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'trend' ? (
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                type="category"
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="end"
                      fill="#666"
                      transform="rotate(-45)"
                    >
                      {payload.value}
                    </text>
                  </g>
                )}
                height={60}
                interval={Math.ceil(trendData.length / 10)}
              />
              <YAxis 
                name="참여율" 
                unit="" 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-semibold">{data.title}</p>
                      <p>날짜: {data.date}</p>
                      <p>참여율: {data.engagement.toFixed(2)}%</p>
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#8884d8" 
                name="참여율"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="likeRatio" name="좋아요 비율" unit="%" />
              <YAxis type="number" dataKey="commentRatio" name="댓글 비율" unit="%" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-semibold">{data.title}</p>
                      <p>좋아요 비율: {data.likeRatio.toFixed(2)}%</p>
                      <p>댓글 비율: {data.commentRatio.toFixed(2)}%</p>
                    </div>
                  );
                }}
              />
              <Scatter name="참여율" data={engagementData} fill="#8884d8" />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 