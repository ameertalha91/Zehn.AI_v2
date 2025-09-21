
import { db } from '@/lib/db';
export async function GET(){ const items = await db.quiz.findMany({ orderBy:{createdAt:'desc'} }); return Response.json({items}); }
export async function POST(req:Request){
  const { title } = await req.json();
  const klass = await db.class.findFirst();
  
  // Create or find a default video
  let defaultVideo = await db.video.findFirst({
    where: { youtubeId: 'default' }
  });
  
  if (!defaultVideo) {
    defaultVideo = await db.video.create({
      data: {
        youtubeId: 'default',
        title: 'Default Video',
        keywords: JSON.stringify(['default', 'video'])
      }
    });
  }
  
  // Create default questions data
  const defaultQuestions = [
    {
      prompt: 'Define Two-Nation Theory.',
      options: ['A', 'B', 'C', 'D'],
      answerIdx: 1
    },
    {
      prompt: 'Year of Objectives Resolution?',
      options: ['1947', '1949', '1956', '1973'],
      answerIdx: 1
    }
  ];
  
  const quiz = await db.quiz.create({ 
    data: { 
      classId: klass!.id, 
      title,
      questions: defaultQuestions,
      videoId: defaultVideo.id,
      timeMarker: 0
    } 
  });
  
  return Response.json(quiz);
}
