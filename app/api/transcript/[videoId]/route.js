// app/api/transcript/[videoId]/route.js
import { db } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { videoId } = params;
    
    // Check if transcript exists in database
    const video = await db.video.findUnique({
      where: { youtubeId: videoId },
      include: { transcript: true }
    });
    
    if (!video || !video.transcript) {
      return Response.json({
        error: 'Transcript not found'
      }, { status: 404 });
    }
    
    return Response.json({
      success: true,
      videoId: videoId,
      content: video.transcript.content,
      segments: video.transcript.segments,
      title: video.title
    });
    
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return Response.json({
      error: 'Failed to fetch transcript'
    }, { status: 500 });
  }
}