
const { PrismaClient } = require('@prisma/client'); const db = new PrismaClient();
async function main(){
  const center = await db.center.create({ data: { name: "Alpha CSS Academy" } });
  const admin = await db.user.create({ data: { email:"admin@alpha.css", name:"Center Admin", role:"ADMIN", centerId:center.id } });
  const tutor = await db.user.create({ data: { email:"tutor@alpha.css", name:"Dr. Khan", role:"TUTOR", centerId:center.id } });
  const student = await db.user.create({ data: { email:"student@alpha.css", name:"Fatima", role:"STUDENT" } });
  const klass = await db.class.create({ data: { name:"Pakistan Affairs – Cohort A", centerId:center.id } });
  await db.enrollment.create({ data: { userId:student.id, classId:klass.id, role:"student" } });
  await db.enrollment.create({ data: { userId:tutor.id, classId:klass.id, role:"tutor" } });
  const lec = await db.lecture.create({ data: { classId:klass.id, title:"Constitutional History Basics", transcript:"Intro → Objectives…" } });
  const quiz = await db.quiz.create({ data: { classId:klass.id, title:"Foundations Quiz" } });
  await db.question.createMany({ data: [
    { quizId:quiz.id, prompt:"Year of 1973 Constitution?", options: JSON.stringify(["1956","1962","1973","2002"]), answerIdx:2 },
    { quizId:quiz.id, prompt:"Who was the first PM of Pakistan?", options: JSON.stringify(["Liaquat Ali Khan","Jinnah","Ayub Khan","Bhutto"]), answerIdx:0 }
  ]});
  console.log("Seeded ✔");
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
