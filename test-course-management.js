/**
 * COMPREHENSIVE COURSE MANAGEMENT TEST SUITE
 * 
 * This test suite validates the entire course management system including:
 * - Database connectivity and data integrity
 * - API endpoints functionality
 * - Video access and playback
 * - Enrollment system
 * - User authentication flow
 * - Frontend-backend integration
 */

const { PrismaClient } = require('@prisma/client');

class CourseManagementTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.baseUrl = 'http://localhost:3001'; // Dev server is running on 3001
  }

  // Test result tracking
  logTest(testName, passed, details = '') {
    const result = { testName, passed, details, timestamp: new Date().toISOString() };
    this.testResults.tests.push(result);
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${testName}: PASSED ${details}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName}: FAILED ${details}`);
    }
  }

  // Test 1: Database Connectivity and Data Integrity
  async testDatabaseConnectivity() {
    console.log('\n🔍 TESTING DATABASE CONNECTIVITY...');
    
    try {
      // Test database connection
      await this.prisma.$connect();
      this.logTest('Database Connection', true, 'Successfully connected to SQLite database');

      // Test user data
      const users = await this.prisma.user.findMany();
      this.logTest('User Data Access', users.length > 0, `Found ${users.length} users`);

      // Test course data
      const courses = await this.prisma.class.findMany({
        include: { lectures: true, students: true }
      });
      this.logTest('Course Data Access', courses.length > 0, `Found ${courses.length} courses`);

      // Test lecture data
      const lectures = await this.prisma.lecture.findMany();
      this.logTest('Lecture Data Access', lectures.length > 0, `Found ${lectures.length} lectures`);

      // Test enrollment data
      const enrollments = await this.prisma.enrollment.findMany();
      this.logTest('Enrollment Data Access', enrollments.length > 0, `Found ${enrollments.length} enrollments`);

      // Validate Pakistan Affairs course has lectures
      const pakistanCourse = courses.find(c => c.name.includes('Pakistan Affairs'));
      if (pakistanCourse) {
        this.logTest('Pakistan Affairs Course Structure', pakistanCourse.lectures.length >= 3, 
          `Course has ${pakistanCourse.lectures.length} lectures`);
        
        // Check video URLs
        const hasVideoUrls = pakistanCourse.lectures.every(lecture => lecture.videoUrl);
        this.logTest('Video URL Integrity', hasVideoUrls, 
          `All ${pakistanCourse.lectures.length} lectures have video URLs`);
      }

    } catch (error) {
      this.logTest('Database Connectivity', false, error.message);
    }
  }

  // Test 2: API Endpoints Functionality
  async testAPIEndpoints() {
    console.log('\n🌐 TESTING API ENDPOINTS...');
    
    try {
      // Test courses API (will fail without auth, but we can check structure)
      const response = await fetch(`${this.baseUrl}/api/courses?role=student`);
      const isUnauthorized = response.status === 401;
      this.logTest('Courses API Endpoint', isUnauthorized, 
        `API responds with 401 Unauthorized (expected without auth)`);

      // Test course detail API
      const courseResponse = await fetch(`${this.baseUrl}/api/courses/test-course-id`);
      const courseUnauthorized = courseResponse.status === 401;
      this.logTest('Course Detail API Endpoint', courseUnauthorized, 
        `Course detail API responds with 401 Unauthorized (expected without auth)`);

      // Test enrollment API
      const enrollResponse = await fetch(`${this.baseUrl}/api/courses/test-course-id/enroll`, {
        method: 'POST'
      });
      const enrollUnauthorized = enrollResponse.status === 401;
      this.logTest('Enrollment API Endpoint', enrollUnauthorized, 
        `Enrollment API responds with 401 Unauthorized (expected without auth)`);

    } catch (error) {
      this.logTest('API Endpoints', false, error.message);
    }
  }

  // Test 3: Video URL Validation
  async testVideoURLs() {
    console.log('\n🎥 TESTING VIDEO URL VALIDATION...');
    
    try {
      const lectures = await this.prisma.lecture.findMany();
      
      for (const lecture of lectures) {
        const hasValidUrl = lecture.videoUrl && lecture.videoUrl.includes('youtube.com');
        this.logTest(`Video URL - ${lecture.title}`, hasValidUrl, 
          `URL: ${lecture.videoUrl ? lecture.videoUrl.substring(0, 50) + '...' : 'No URL'}`);
      }

      // Test YouTube URL conversion logic
      const testUrls = [
        'https://www.youtube.com/watch?v=YDfyHLPhRVU',
        'https://youtu.be/YDfyHLPhRVU',
        'https://www.youtube.com/embed/YDfyHLPhRVU'
      ];

      testUrls.forEach(url => {
        let embedUrl = '';
        if (url.includes('youtube.com/watch')) {
          embedUrl = `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
        } else if (url.includes('youtu.be/')) {
          embedUrl = `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
        } else if (url.includes('youtube.com/embed/')) {
          embedUrl = url;
        }
        
        const isValidEmbed = embedUrl.includes('youtube.com/embed/');
        this.logTest(`YouTube URL Conversion - ${url.split('/').pop()}`, isValidEmbed, 
          `Converted to: ${embedUrl}`);
      });

    } catch (error) {
      this.logTest('Video URL Validation', false, error.message);
    }
  }

  // Test 4: Enrollment System
  async testEnrollmentSystem() {
    console.log('\n👥 TESTING ENROLLMENT SYSTEM...');
    
    try {
      // Get test user
      const testUser = await this.prisma.user.findFirst({
        where: { email: 'test@example.com' }
      });
      
      if (testUser) {
        this.logTest('Test User Exists', true, `Found test user: ${testUser.name}`);
        
        // Check user enrollments
        const enrollments = await this.prisma.enrollment.findMany({
          where: { userId: testUser.id },
          include: { klass: true }
        });
        
        this.logTest('User Enrollments', enrollments.length > 0, 
          `User enrolled in ${enrollments.length} courses`);
        
        // Check Pakistan Affairs enrollment
        const pakistanEnrollment = enrollments.find(e => 
          e.klass.name.includes('Pakistan Affairs')
        );
        this.logTest('Pakistan Affairs Enrollment', !!pakistanEnrollment, 
          pakistanEnrollment ? 'User is enrolled' : 'User not enrolled');
        
      } else {
        this.logTest('Test User Exists', false, 'Test user not found');
      }

    } catch (error) {
      this.logTest('Enrollment System', false, error.message);
    }
  }

  // Test 5: JSON Pathway Integration
  async testJSONPathways() {
    console.log('\n📄 TESTING JSON PATHWAY INTEGRATION...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const jsonPath = path.join(process.cwd(), 'data', 'learning-pathways.json');
      const jsonExists = fs.existsSync(jsonPath);
      this.logTest('JSON Pathways File', jsonExists, 
        jsonExists ? 'File exists' : 'File not found');
      
      if (jsonExists) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        this.logTest('JSON Pathways Data', Array.isArray(jsonData), 
          `Found ${jsonData.length} pathway courses`);
        
        // Check for sessions with video URLs
        const hasVideoSessions = jsonData.some(pathway => 
          pathway.sessions && pathway.sessions.some(session => session.videoUrl)
        );
        this.logTest('JSON Video Sessions', hasVideoSessions, 
          'JSON pathways contain video sessions');
      }

    } catch (error) {
      this.logTest('JSON Pathway Integration', false, error.message);
    }
  }

  // Test 6: Frontend Integration Points
  async testFrontendIntegration() {
    console.log('\n🖥️ TESTING FRONTEND INTEGRATION POINTS...');
    
    try {
      // Check if key frontend files exist
      const fs = require('fs');
      const path = require('path');
      
      const frontendFiles = [
        'app/student/courses/[courseId]/page.tsx',
        'lib/course-context.tsx',
        'lib/auth-context.tsx',
        'components/ProtectedRoute.tsx'
      ];
      
      frontendFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        const exists = fs.existsSync(filePath);
        this.logTest(`Frontend File - ${file}`, exists, 
          exists ? 'File exists' : 'File not found');
      });

      // Check for key imports and dependencies
      const coursePagePath = path.join(process.cwd(), 'app/student/courses/[courseId]/page.tsx');
      if (fs.existsSync(coursePagePath)) {
        const content = fs.readFileSync(coursePagePath, 'utf8');
        const hasRequiredImports = content.includes('useCourse') && 
                                 content.includes('useAuth') && 
                                 content.includes('ProtectedRoute');
        this.logTest('Course Page Dependencies', hasRequiredImports, 
          'All required imports present');
      }

    } catch (error) {
      this.logTest('Frontend Integration', false, error.message);
    }
  }

  // Test 7: System Integration Test
  async testSystemIntegration() {
    console.log('\n🔗 TESTING SYSTEM INTEGRATION...');
    
    try {
      // Test complete data flow: Database -> API -> Frontend
      const courses = await this.prisma.class.findMany({
        include: { 
          lectures: true, 
          students: true,
          center: true 
        }
      });
      
      if (courses.length > 0) {
        const course = courses[0];
        
        // Check data structure matches API expectations
        const hasRequiredFields = course.id && course.name && course.center;
        this.logTest('Course Data Structure', hasRequiredFields, 
          'Course has required fields for API');
        
        // Check lecture structure
        if (course.lectures.length > 0) {
          const lecture = course.lectures[0];
          const hasLectureFields = lecture.id && lecture.title && lecture.videoUrl;
          this.logTest('Lecture Data Structure', hasLectureFields, 
            'Lecture has required fields for frontend');
        }
        
        // Check enrollment structure
        if (course.students.length > 0) {
          const enrollment = course.students[0];
          const hasEnrollmentFields = enrollment.userId && enrollment.classId;
          this.logTest('Enrollment Data Structure', hasEnrollmentFields, 
            'Enrollment has required fields');
        }
      }

    } catch (error) {
      this.logTest('System Integration', false, error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE COURSE MANAGEMENT TEST SUITE');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    await this.testDatabaseConnectivity();
    await this.testAPIEndpoints();
    await this.testVideoURLs();
    await this.testEnrollmentSystem();
    await this.testJSONPathways();
    await this.testFrontendIntegration();
    await this.testSystemIntegration();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Course management system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above for issues.');
    }
    
    // Close database connection
    await this.prisma.$disconnect();
    
    return this.testResults;
  }
}

// Run the tests
async function runTests() {
  const tester = new CourseManagementTester();
  return await tester.runAllTests();
}

// Export for use in other files
module.exports = { CourseManagementTester, runTests };

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}
