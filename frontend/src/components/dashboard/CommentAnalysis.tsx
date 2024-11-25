import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyzeVideoComments } from '@/lib/api';

interface Keyword {
  word: string;
  count: number;
  examples: string[];
}

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  examples: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

interface Category {
  name: string;
  examples: string[];
}

interface Feedback {
  type: string;
  content: string;
  examples: string[];
}

interface AnalysisResult {
  keywords: Keyword[];
  sentiment: SentimentData;
  categories: Category[];
  feedback: Feedback[];
}

export default function CommentAnalysis({ videoId }: { videoId: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [videoId]);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyzeVideoComments(videoId);
      
      console.log('Received data:', data);

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      const formattedData: AnalysisResult = {
        keywords: parsedData.keywords || [],
        sentiment: {
          positive: parsedData.sentiment?.positive || 0,
          negative: parsedData.sentiment?.negative || 0,
          neutral: parsedData.sentiment?.neutral || 0,
          examples: {
            positive: parsedData.sentiment?.examples?.positive || [],
            negative: parsedData.sentiment?.examples?.negative || [],
            neutral: parsedData.sentiment?.examples?.neutral || []
          }
        },
        categories: parsedData.categories || [],
        feedback: parsedData.feedback || []
      };

      setAnalysis(formattedData);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('댓글 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-gray-600">댓글을 분석하고 있습니다...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-500">{error}</div>
        <button
          onClick={fetchAnalysis}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-gray-600">분석 결과가 없습니다.</div>
        </div>
      </div>
    );
  }

  const SENTIMENT_COLORS = ['#00C49F', '#FF8042', '#FFBB28'];

  return (
    <div className="space-y-8">
      {/* 대시보드 요약 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900">댓글 분석 대시보드</h2>

        {/* 키워드 요약 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">주요 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-blue-100 px-3 py-1 rounded-full text-blue-800"
              >
                {keyword.word} ({keyword.count}회)
              </span>
            ))}
          </div>
        </div>

        {/* 감정 분석 차트 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">감정 분석</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '긍정', value: analysis.sentiment.positive },
                    { name: '부정', value: analysis.sentiment.negative },
                    { name: '중립', value: analysis.sentiment.neutral }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {SENTIMENT_COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 주제 요약 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">주요 주제</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {analysis.categories.map((category, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-800">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 피드백 요약 */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">주요 피드백</h3>
          <div className="space-y-2">
            {analysis.feedback.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-800">{item.type}:</span>
                <span className="text-gray-700 ml-2">{item.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 댓글 분석 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900">상세 댓글 분석</h2>

        {/* 키워드별 댓글 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">키워드별 댓글</h3>
          <div className="space-y-4">
            {analysis.keywords.map((keyword, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">"{keyword.word}" 관련 댓글</h4>
                <div className="pl-4 border-l-2 border-blue-200 space-y-2">
                  {keyword.examples.map((example, i) => (
                    <p key={i} className="text-gray-600">"{example}"</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 감정별 댓글 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">감정별 댓글</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-semibold text-green-700 mb-2">긍정적인 댓글</h4>
              {analysis.sentiment.examples.positive.map((comment, i) => (
                <p key={i} className="text-gray-600 mb-2">"{comment}"</p>
              ))}
            </div>
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <h4 className="font-semibold text-red-700 mb-2">부정적인 댓글</h4>
              {analysis.sentiment.examples.negative.map((comment, i) => (
                <p key={i} className="text-gray-600 mb-2">"{comment}"</p>
              ))}
            </div>
            <div className="border-l-4 border-gray-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-700 mb-2">중립적인 댓글</h4>
              {analysis.sentiment.examples.neutral.map((comment, i) => (
                <p key={i} className="text-gray-600 mb-2">"{comment}"</p>
              ))}
            </div>
          </div>
        </div>

        {/* 주제별 댓글 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">주제별 댓글</h3>
          <div className="space-y-4">
            {analysis.categories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{category.name}</h4>
                <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                  {category.examples.map((example, i) => (
                    <p key={i} className="text-gray-600">"{example}"</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 피드백별 댓글 */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">피드백별 댓글</h3>
          <div className="space-y-4">
            {analysis.feedback.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {item.type}: {item.content}
                </h4>
                <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                  {item.examples.map((example, i) => (
                    <p key={i} className="text-gray-600">"{example}"</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
