
import './globals.css';
import Nav from '@/components/Nav';
import AdminToolbar from '@/components/AdminToolbar';
import { AuthProvider } from '@/lib/auth-context';
import { CourseProvider } from '@/lib/course-context';

export const metadata = { title:'Zehn.AI – CSS', description:'Agentic CSS prep (B2C + B2B2C)' };

export default function Root({children}:{children:React.ReactNode}){
  return (
        <html lang="en">
          <body>
            <AuthProvider>
              <CourseProvider>
                <AdminToolbar />
                <Nav/>
                <main>{children}</main>
              </CourseProvider>
            </AuthProvider>
          </body>
        </html>
  );
}
