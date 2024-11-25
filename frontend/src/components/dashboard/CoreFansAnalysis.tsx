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
  firstActivityDate: string;
  lastActivityDate: string;
  engagementRate: number;
}

interface CoreFansAnalysisProps {
  channelId: string;
  channelTitle: string;
}

interface FanCommentsModalProps {
  fan: CoreFan;
  onClose: () => void;
}

function FanCommentsModal({ fan, onClose }: FanCommentsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {fan.author}님의 모든 댓글 ({fan.comments.length}개)
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {fan.comments.sort((a, b) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          ).map((comment, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-blue-600 hover:underline">
                    <a href={`https://youtube.com/watch?v=${comment.videoId}`} target="_blank" rel="noopener noreferrer">
                      {comment.videoTitle}
                    </a>
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.publishedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {comment.likeCount}
                </div>
              </div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoreFansAnalysis({ channelId, channelTitle }: CoreFansAnalysisProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [coreFans, setCoreFans] = useState<CoreFan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFan, setSelectedFan] = useState<CoreFan | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const channelComments: Comment[] = await getChannelComments(channelId);
        
        // 채널 주인의 댓글 제외
        const filteredComments = channelComments.filter((comment: Comment) => 
          comment.author.toLowerCase() !== channelTitle.toLowerCase() &&
          !comment.authorChannelId?.value?.includes(channelId)
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

        // 핵심 팬 선별 (날짜 정렬 로직 추가)
        const coreFansData = Array.from(fansMap.entries())
          .map(([author, data]) => {
            // 댓글을 날짜순으로 정렬
            const sortedComments = data.comments.sort((a, b) => 
              new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
            );

            return {
              author,
              commentCount: data.commentCount,
              totalLikes: data.totalLikes,
              comments: sortedComments,
              uniqueVideos: data.videoIds.size,
              lastComment: sortedComments[sortedComments.length - 1].text,
              firstActivityDate: sortedComments[0].publishedAt,
              lastActivityDate: sortedComments[sortedComments.length - 1].publishedAt,
              engagementRate: data.videoIds.size / channelComments.length
            };
          })
          .filter(fan => fan.commentCount >= 3)
          .sort((a, b) => b.commentCount - a.commentCount)
          .slice(0, 10);

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
  }, [channelId, channelTitle]);

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
                <div className="text-sm text-gray-500 mt-1">
                  활동 기간: {new Date(fan.firstActivityDate).toLocaleDateString()} ~ {new Date(fan.lastActivityDate).toLocaleDateString()}
                  {' '}
                  <span className="text-gray-400">
                    ({Math.ceil((new Date(fan.lastActivityDate).getTime() - new Date(fan.firstActivityDate).getTime()) / (1000 * 60 * 60 * 24))}일)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFan(fan)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  모든 댓글 보기 →
                </button>
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

      {selectedFan && (
        <FanCommentsModal
          fan={selectedFan}
          onClose={() => setSelectedFan(null)}
        />
      )}
    </div>
  );
} 