import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/memoryStore';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoId, youtubeUrl, keywords } = await req.json();
    
    console.log('Processing video:', videoId, 'keywords:', keywords);
    
    // Store video with keywords
    const video = await memoryDb.video.create({
      data: {
        youtubeId: videoId,
        title: youtubeUrl,
        keywords: keywords
      }
    });
    
    // Generate initial quiz based on keywords
    await generateQuizFromKeywords(video.id, keywords);
    
    return NextResponse.json({
      success: true,
      message: 'Video processed and quiz generated',
      videoId: video.id
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

async function generateQuizFromKeywords(videoId: string, keywords: string[]) {
  // Generate questions using OpenAI instead of database lookup
  const questions = await generateQuestionsUsingAI(keywords);
  
  // Store quiz
  await memoryDb.quiz.create({
    data: {
      videoId,
      questions: questions,
      timeMarker: 300 // 5 minutes
    }
  });
}

async function generateQuestionsUsingAI(keywords: string[]) {
  try {
    const prompt = `Generate 3 multiple choice questions about ${keywords.join(', ')} for a CSS exam. Format as JSON with structure: [{id: string, question: string, options: string[], correct: number}]`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Create exam questions formatted as JSON. Each question should have 4 options with one correct answer."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return result.questions || [];
  } catch (error) {
    console.error('Error generating questions:', error);
    return [
      {
        id: '1',
        question: `Sample question about ${keywords[0] || 'Pakistan Studies'}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 0
      }
    ];
  }
}
}
