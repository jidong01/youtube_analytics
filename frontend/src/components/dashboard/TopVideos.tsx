interface Video {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
  }
  
  interface TopVideosProps {
    videos: Video[];
  }
  
  export default function TopVideos({ videos }: TopVideosProps) {
    // 조회수 기준으로 정렬하고 상위 10개 선택
    const topVideos = [...videos]
      .sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount))
      .slice(0, 10);
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900">인기 동영상 TOP 10</h2>
        <div className="space-y-4">
          {topVideos.map((video, index) => (
            <div key={video.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 text-2xl font-bold text-gray-900 w-8">
                {index + 1}
              </div>
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                <div className="text-sm text-gray-800 mt-1">
                  <span className="mr-4">조회수: {parseInt(video.viewCount).toLocaleString()}회</span>
                  <span className="mr-4">좋아요: {parseInt(video.likeCount).toLocaleString()}</span>
                  <span>댓글: {parseInt(video.commentCount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } 