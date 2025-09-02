import OpenAI from 'openai';
import ytdl from 'ytdl-core';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processVideo(youtubeId: string) {
  try {
    console.log('Processing video:', youtubeId);
    
    // Download audio from YouTube
    const audioStream = ytdl(`https://www.youtube.com/watch?v=${youtubeId}`, {
      quality: 'lowestaudio'
    });

    // Transcribe using Whisper API
    const response = await openai.audio.transcriptions.create({
      file: audioStream as any,
      model: "whisper-1",
      response_format: "verbose_json"
    });

    // Return transcription result directly without database storage
    return {
      id: youtubeId,
      youtubeId,
      title: "Processed Video",
      transcript: {
        id: `transcript_${youtubeId}`,
        content: response.text,
        segments: response.segments
      }
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}
          segments: response.segments
        }
      }
    },
    include: { transcript: true }
  });

  // Generate initial quiz data
  await generateQuizData(video.id, response.text);

  return video;
}

async function generateQuizData(videoId: string, transcript: string) {
  // Generate quizzes every 5 minutes
  const quizIntervals = Math.floor(transcript.length / 300);
  
  for (let i = 1; i <= quizIntervals; i++) {
    const timeMarker = i * 300;
    
    // Generate quiz questions using GPT
    const questions = await generateQuestionsFromTranscript(
      transcript,
      timeMarker
    );

    await db.quizData.create({
      data: {
        videoId,
        timeMarker,
        questions
      }
    });
  }
}

async function generateQuestionsFromTranscript(
  transcript: string, 
  timeMarker: number
) {
  // Generate contextual quiz questions
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Generate 3 multiple choice questions based on the transcript context"
      },
      {
        role: "user",
        content: transcript
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
