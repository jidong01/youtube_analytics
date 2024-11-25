interface Comment {
  author: string;
  text: string;
  publishedAt: string;
  likeCount: number;
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">전체 댓글 ({comments.length}개)</h2>
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="border-b last:border-b-0 pb-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{comment.author}</span>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">
                  {new Date(comment.publishedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {comment.likeCount}
                </div>
              </div>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 