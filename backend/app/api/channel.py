from fastapi import APIRouter, HTTPException
from ..services.youtube_service import YouTubeService
from ..services.openai_service import OpenAIService
from typing import Dict, Any

router = APIRouter()
youtube_service = YouTubeService()
openai_service = OpenAIService()

@router.get("/channel/{channel_id}")
async def get_channel_info(channel_id: str) -> Dict[str, Any]:
    channel_info = await youtube_service.get_channel_info(channel_id)
    if not channel_info:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel_info

@router.get("/channel/{channel_id}/videos")
async def get_channel_videos(channel_id: str):
    videos = await youtube_service.get_channel_videos(channel_id)
    if not videos:
        raise HTTPException(status_code=404, detail="Videos not found")
    return videos

@router.get("/videos/{video_id}/comments")
async def get_video_comments(video_id: str):
    comments = await youtube_service.get_video_comments(video_id)
    if not comments:
        raise HTTPException(status_code=404, detail="Comments not found")
    return comments

@router.get("/videos/{video_id}/analysis")
async def analyze_video_comments(video_id: str):
    comments = await youtube_service.get_video_comments(video_id)
    if not comments:
        raise HTTPException(status_code=404, detail="Comments not found")
    
    comment_texts = [comment["text"] for comment in comments]
    analysis = await openai_service.analyze_comments(comment_texts)
    
    if not analysis:
        raise HTTPException(status_code=500, detail="Comment analysis failed")
    
    return analysis

@router.get("/channel/{channel_id}/comments")
async def get_channel_comments(channel_id: str):
    comments = await youtube_service.get_channel_comments(channel_id)
    if not comments:
        raise HTTPException(status_code=404, detail="Comments not found")
    return comments

@router.post("/analysis/chart")
async def analyze_chart(
    chart_type: str,
    data: dict
):
    analysis = await openai_service.analyze_chart_data(chart_type, data)
    if not analysis:
        raise HTTPException(status_code=500, detail="Analysis failed")
    return {"analysis": analysis} 