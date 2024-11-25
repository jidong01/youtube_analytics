from googleapiclient.discovery import build
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

class YouTubeService:
    def __init__(self):
        self.youtube = build('youtube', 'v3', 
                           developerKey=os.getenv('YOUTUBE_API_KEY'))
    
    async def get_channel_info(self, channel_id: str) -> Optional[Dict[str, Any]]:
        try:
            channel_response = self.youtube.channels().list(
                part='snippet,statistics,contentDetails',
                id=channel_id
            ).execute()
            
            if not channel_response['items']:
                return None
                
            channel_data = channel_response['items'][0]
            return {
                'id': channel_id,
                'title': channel_data['snippet']['title'],
                'description': channel_data['snippet']['description'],
                'subscriberCount': channel_data['statistics']['subscriberCount'],
                'videoCount': channel_data['statistics']['videoCount'],
                'viewCount': channel_data['statistics']['viewCount'],
                'thumbnail': channel_data['snippet']['thumbnails']['default']['url'],
                'customUrl': channel_data['snippet'].get('customUrl', ''),
                'publishedAt': channel_data['snippet']['publishedAt']
            }
        except Exception as e:
            print(f"Error fetching channel info: {e}")
            return None

    async def get_channel_videos(self, channel_id: str, max_results: int = None):
        try:
            # 채널의 업로드 재생목록 ID 가져오기
            channel_response = self.youtube.channels().list(
                part='contentDetails',
                id=channel_id
            ).execute()
            
            uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            
            videos = []
            next_page_token = None
            
            while True:
                playlist_items = self.youtube.playlistItems().list(
                    part='snippet,contentDetails',
                    playlistId=uploads_playlist_id,
                    maxResults=50,  # YouTube API의 한 번의 요청당 최대값
                    pageToken=next_page_token
                ).execute()
                
                # 비디오 ID 목록 생성
                video_ids = [item['contentDetails']['videoId'] for item in playlist_items['items']]
                
                # 비디오 상세 정보 가져오기
                video_response = self.youtube.videos().list(
                    part='statistics,contentDetails',
                    id=','.join(video_ids)
                ).execute()
                
                # 비디오 정보 결합
                for playlist_item, video_details in zip(playlist_items['items'], video_response['items']):
                    videos.append({
                        'id': playlist_item['contentDetails']['videoId'],
                        'title': playlist_item['snippet']['title'],
                        'description': playlist_item['snippet']['description'],
                        'thumbnail': playlist_item['snippet']['thumbnails']['medium']['url'],
                        'publishedAt': playlist_item['snippet']['publishedAt'],
                        'viewCount': video_details['statistics'].get('viewCount', '0'),
                        'likeCount': video_details['statistics'].get('likeCount', '0'),
                        'commentCount': video_details['statistics'].get('commentCount', '0'),
                        'duration': video_details['contentDetails']['duration']
                    })
                
                next_page_token = playlist_items.get('nextPageToken')
                
                # max_results가 지정되 경우에만 체크
                if max_results and len(videos) >= max_results:
                    videos = videos[:max_results]
                    break
                    
                # 더 이상 가져올 비디오가 없다면 중단
                if not next_page_token:
                    break
                    
            return videos
                
        except Exception as e:
            print(f"Error fetching channel videos: {e}")
            return None

    async def get_video_comments(self, video_id: str, max_results: int = 100):
        try:
            comments = []
            next_page_token = None

            while len(comments) < max_results:
                request = self.youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    maxResults=min(100, max_results - len(comments)),
                    pageToken=next_page_token,
                    textFormat="plainText"
                )

                try:
                    response = request.execute()
                except Exception as e:
                    print(f"Error fetching comments: {str(e)}")
                    break

                for item in response.get("items", []):
                    comment = item["snippet"]["topLevelComment"]["snippet"]
                    comments.append({
                        "text": comment["textDisplay"],
                        "author": comment["authorDisplayName"],
                        "likeCount": comment.get("likeCount", 0),
                        "publishedAt": comment["publishedAt"]
                    })

                next_page_token = response.get("nextPageToken")
                if not next_page_token:
                    break

            return comments

        except Exception as e:
            print(f"Error in get_video_comments: {str(e)}")
            return []

    async def get_channel_comments(self, channel_id: str) -> List[Dict]:
        try:
            # 1. 먼저 채널의 모든 비디오 ID 가져오기
            videos = await self.get_channel_videos(channel_id)
            if not videos:
                return []

            all_comments = []
            
            # 2. 각 비디오의 댓글 가져오기
            for video in videos:
                try:
                    comments = await self.get_video_comments(video['id'])
                    if comments:
                        # 비디오 정보 추가
                        for comment in comments:
                            comment['videoId'] = video['id']
                            comment['videoTitle'] = video['title']
                            comment['videoPublishedAt'] = video['publishedAt']
                        all_comments.extend(comments)
                    
                    # API 할당량 초과 방지를 위한 짧은 대기
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    print(f"Error fetching comments for video {video['id']}: {str(e)}")
                    continue
            
            return all_comments
            
        except Exception as e:
            print(f"Error in get_channel_comments: {str(e)}")
            return []