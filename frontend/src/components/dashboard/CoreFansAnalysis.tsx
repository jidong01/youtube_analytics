import { getVideoComments, getChannelComments } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Comment {
  author: string;
  text: string;
  publishedAt: string;
  likeCount: number;
  videoId: string;
  videoTitle: string;
  videoPublishedAt: string;
  authorChannelId?: {
    value: string;
  };
}

interface CoreFan {
  author: string;
  commentCount: number;
  totalLikes: number;
  comments: Comment[];
  uniqueVideos: number;
  lastComment: string;
  lastCommentDate: string;
  engagementRate: number;
}

interface CoreFansAnalysisProps {
  channelId: string;
  channelTitle: string;
}

export default function CoreFansAnalysis({ channelId, channelTitle }: CoreFansAnalysisProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [coreFans, setCoreFans] = useState<CoreFan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const channelComments: Comment[] = await getChannelComments(channelId);
        
        // 채널 주인의 댓글 제외
        const filteredComments = channelComments.filter((comment: Comment) => 
          comment.author.toLowerCase() !== channelTitle.toLowerCase() &&  // 채널명으로 필터링
          !comment.authorChannelId?.value?.includes(channelId)  // 채널 ID로 필터링 (더 정확)
        );

        setComments(filteredComments);
        
        // 팬 분석 로직
        const fansMap = new Map<string, {
          commentCount: number;
          totalLikes: number;
          comments: Comment[];
          videoIds: Set<string>;
        }>();

        filteredComments.forEach(comment => {
          const fanData = fansMap.get(comment.author) || {
            commentCount: 0,
            totalLikes: 0,
            comments: [],
            videoIds: new Set()
          };

          fanData.commentCount += 1;
          fanData.totalLikes += comment.likeCount;
          fanData.comments.push(comment);
          fanData.videoIds.add(comment.videoId);

          fansMap.set(comment.author, fanData);
        });

        // 핵심 팬 선별
        const coreFansData = Array.from(fansMap.entries())
          .map(([author, data]) => ({
            author,
            commentCount: data.commentCount,
            totalLikes: data.totalLikes,
            comments: data.comments,
            uniqueVideos: data.videoIds.size,
            lastComment: data.comments[data.comments.length - 1].text,
            lastCommentDate: data.comments[data.comments.length - 1].publishedAt,
            engagementRate: data.videoIds.size / channelComments.length
          }))
          .filter(fan => fan.commentCount >= 3)  // 최소 3개 이상 댓글
          .sort((a, b) => b.commentCount - a.commentCount)
          .slice(0, 10);  // 상위 10명

        setCoreFans(coreFansData);
        
      } catch (err) {
        setError('댓글을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (channelId) {
      fetchComments();
    }
  }, [channelId, channelTitle]);  // channelTitle 의존성 추가

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="text-gray-600">핵심 팬 분석 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">핵심 팬 분석</h2>
      <div className="space-y-6">
        {coreFans.map((fan, index) => (
          <div key={fan.author} className="border-b last:border-b-0 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium">{fan.author}</span>
                  {index < 3 && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Top {index + 1}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  댓글 {fan.commentCount}개 • 받은 좋아요 {fan.totalLikes}개
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  최근 영상 참여율: {(fan.engagementRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                마지막 활동: {new Date(fan.lastCommentDate).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600 italic">
              "{fan.lastComment.length > 100 
                ? fan.lastComment.slice(0, 100) + '...' 
                : fan.lastComment}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 