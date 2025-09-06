import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define video type
type Video = {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  description: string;
  duration: string;
  thumbnail: string;
  views: number;
  uploadDate: string;
};

// Path to store videos data (for demo purposes)
const videosFilePath = path.join(process.cwd(), 'data', 'videos.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(videosFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read videos from file
const readVideos = (): Video[] => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(videosFilePath)) {
      const data = fs.readFileSync(videosFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading videos:', error);
    return [];
  }
};

// Write videos to file
const writeVideos = (videos: Video[]) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2));
  } catch (error) {
    console.error('Error writing videos:', error);
    throw new Error('Failed to save video');
  }
};

// Extract video ID from YouTube URL
const extractVideoId = (url: string): string => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : '';
};

// GET - Fetch all videos
export async function GET() {
  try {
    const videos = readVideos();
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST - Add new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, title, instructor, subject, description, duration } = body;

    // Validate required fields
    if (!videoUrl || !title || !instructor || !subject || !description || !duration) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Read existing videos
    const videos = readVideos();

    // Check if video already exists
    if (videos.some(video => video.id === videoId)) {
      return NextResponse.json(
        { success: false, error: 'Video already exists in library' },
        { status: 400 }
      );
    }

    // Create new video object
    const newVideo: Video = {
      id: videoId,
      title,
      instructor,
      subject,
      description,
      duration,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      views: 0,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    // Add to videos array
    videos.push(newVideo);

    // Save to file
    writeVideos(videos);

    return NextResponse.json({
      success: true,
      message: 'Video added successfully',
      video: newVideo
    });

  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add video' },
      { status: 500 }
    );
  }
}

// DELETE - Remove video (optional for later)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const videos = readVideos();
    const filteredVideos = videos.filter(video => video.id !== videoId);

    if (videos.length === filteredVideos.length) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    writeVideos(filteredVideos);

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
