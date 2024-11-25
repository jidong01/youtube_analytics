import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

interface VideoListProps {
  videos: Video[];
}

export default function VideoList({ videos }: VideoListProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">최근 업로드된 동영상</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="border rounded-lg overflow-hidden">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900">
                {video.title}
              </h3>
              <div className="text-sm text-gray-800 space-y-1">
                <p>조회수: {parseInt(video.viewCount).toLocaleString()}회</p>
                <p>좋아요: {parseInt(video.likeCount).toLocaleString()}</p>
                <p>댓글: {parseInt(video.commentCount).toLocaleString()}</p>
                <p>업로드: {formatDistanceToNow(new Date(video.publishedAt), { 
                  addSuffix: true,
                  locale: ko 
                })}</p>
              </div>
              <div className="mt-4">
                <Link 
                  href={`/analysis/${video.id}`}
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  댓글 분석하기
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 