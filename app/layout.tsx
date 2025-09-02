
import './globals.css'; import Nav from '@/components/Nav';
export const metadata = { title:'Zehn.AI – CSS', description:'Agentic CSS prep (B2C + B2B2C)' };
export default function Root({children}:{children:React.ReactNode}){
  return (<html lang="en"><body><Nav/><main>{children}</main></body></html>);
}
