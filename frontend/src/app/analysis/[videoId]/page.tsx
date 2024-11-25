'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CommentAnalysis from '@/components/dashboard/CommentAnalysis';
import Link from 'next/link';

export default function VideoAnalysisPage() {
  const params = useParams();
  const videoId = params.videoId as string;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 네비게이션 */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            대시보드로 돌아가기
          </Link>
        </div>

        {/* 분석 컴포넌트 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">동영상 댓글 분석</h1>
          <CommentAnalysis videoId={videoId} />
        </div>
      </div>
    </div>
  );
} 