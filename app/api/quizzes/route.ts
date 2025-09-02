
import { db } from '@/lib/db';
export async function GET(){ const items = await db.quiz.findMany({ orderBy:{createdAt:'desc'} }); return Response.json({items}); }
export async function POST(req:Request){
  const { title } = await req.json();
  const klass = await db.class.findFirst();
  const quiz = await db.quiz.create({ data:{ classId: klass!.id, title } });
  await db.question.createMany({ data:[
    { quizId:quiz.id, prompt:'Define Two-Nation Theory.', options:JSON.stringify(['A','B','C','D']), answerIdx:1 },
    { quizId:quiz.id, prompt:'Year of Objectives Resolution?', options:JSON.stringify(['1947','1949','1956','1973']), answerIdx:1 }
  ]});
  return Response.json(quiz);
}
