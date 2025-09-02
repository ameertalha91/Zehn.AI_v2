
import Admin from './parts/Admin'; import Tutor from './parts/Tutor'; import Student from './parts/Student';
export default function Dash({searchParams}:{searchParams:{as?:string}}){
  const role = searchParams.as ?? 'STUDENT';
  if(role==='ADMIN') return <Admin/>;
  if(role==='TUTOR') return <Tutor/>;
  return <Student/>;
}
