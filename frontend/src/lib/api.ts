import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

export const getChannelInfo = async (channelId: string) => {
  try {
    const response = await api.get(`/channel/${channelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
};

export const getChannelVideos = async (channelId: string) => {
  try {
    const response = await api.get(`/channel/${channelId}/videos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    throw error;
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    const response = await api.get(`/videos/${videoId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video comments:', error);
    throw error;
  }
};

export const analyzeVideoComments = async (videoId: string) => {
  try {
    const response = await api.get(`/videos/${videoId}/analysis`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing video comments:', error);
    throw error;
  }
};

export const getChannelComments = async (channelId: string) => {
  try {
    const response = await api.get(`/channel/${channelId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching channel comments:', error);
    throw error;
  }
};

export const getChartAnalysis = async (chartType: string, data: any) => {
  try {
    const response = await api.post('/analysis/chart', {
      chart_type: chartType,
      data: data
    });
    return response.data.analysis;
  } catch (error) {
    console.error('Error getting chart analysis:', error);
    throw error;
  }
};
