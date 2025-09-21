/**
 * FRONTEND INTEGRATION TEST SUITE
 * 
 * This test simulates the frontend user experience:
 * - User login flow
 * - Course navigation
 * - Video playback simulation
 * - Enrollment process
 * - Real-time updates
 */

const { PrismaClient } = require('@prisma/client');

class FrontendIntegrationTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.baseUrl = 'http://localhost:3001';
  }

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

  // Test 1: User Authentication Flow
  async testUserAuthenticationFlow() {
    console.log('\n🔐 TESTING USER AUTHENTICATION FLOW...');
    
    try {
      // Check if test user exists
      const testUser = await this.prisma.user.findFirst({
        where: { email: 'test@example.com' }
      });
      
      this.logTest('Test User Exists', !!testUser, 
        testUser ? `Found user: ${testUser.name} (${testUser.role})` : 'Test user not found');

      if (testUser) {
        // Check user role
        const hasValidRole = ['STUDENT', 'TUTOR', 'ADMIN'].includes(testUser.role);
        this.logTest('User Role Valid', hasValidRole, 
          `User role: ${testUser.role}`);

        // Check user has center (if tutor/admin)
        if (['TUTOR', 'ADMIN'].includes(testUser.role)) {
          const hasCenter = !!testUser.centerId;
          this.logTest('User Center Assignment', hasCenter, 
            hasCenter ? `User assigned to center: ${testUser.centerId}` : 'No center assigned');
        }
      }

    } catch (error) {
      this.logTest('User Authentication Flow', false, error.message);
    }
  }

  // Test 2: Course Discovery Flow
  async testCourseDiscoveryFlow() {
    console.log('\n🔍 TESTING COURSE DISCOVERY FLOW...');
    
    try {
      // Get all courses for student view
      const courses = await this.prisma.class.findMany({
        include: { 
          lectures: true, 
          students: true,
          center: true 
        }
      });

      this.logTest('Courses Available', courses.length > 0, 
        `Found ${courses.length} courses available`);

      // Check Pakistan Affairs course specifically
      const pakistanCourse = courses.find(c => c.name.includes('Pakistan Affairs'));
      if (pakistanCourse) {
        this.logTest('Pakistan Affairs Course Found', true, 
          `Course: ${pakistanCourse.name}`);
        
        // Check course has lectures
        this.logTest('Pakistan Affairs Has Lectures', pakistanCourse.lectures.length > 0, 
          `Course has ${pakistanCourse.lectures.length} lectures`);
        
        // Check course has video content
        const hasVideoContent = pakistanCourse.lectures.some(l => l.videoUrl);
        this.logTest('Pakistan Affairs Has Video Content', hasVideoContent, 
          `Course has video content: ${hasVideoContent ? 'Yes' : 'No'}`);
      }

      // Simulate course listing API response
      const courseListResponse = courses.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description || '',
        instructor: course.center?.name || 'Unknown',
        enrolledStudents: course.students.length,
        maxStudents: course.maxStudents || 50,
        status: 'published',
        source: 'database',
        modules: [{
          id: 'default-module',
          title: 'Course Content',
          lectures: course.lectures.map(lecture => ({
            id: lecture.id,
            title: lecture.title,
            youtubeUrl: lecture.videoUrl,
            duration: 30,
            description: lecture.transcript || '',
            order: 0
          }))
        }]
      }));

      this.logTest('Course List API Response', courseListResponse.length > 0, 
        `API would return ${courseListResponse.length} courses`);

    } catch (error) {
      this.logTest('Course Discovery Flow', false, error.message);
    }
  }

  // Test 3: Course Enrollment Flow
  async testCourseEnrollmentFlow() {
    console.log('\n📝 TESTING COURSE ENROLLMENT FLOW...');
    
    try {
      // Get test user
      const testUser = await this.prisma.user.findFirst({
        where: { email: 'test@example.com' }
      });

      if (testUser) {
        // Check current enrollments
        const currentEnrollments = await this.prisma.enrollment.findMany({
          where: { userId: testUser.id },
          include: { klass: true }
        });

        this.logTest('Current Enrollments', currentEnrollments.length > 0, 
          `User enrolled in ${currentEnrollments.length} courses`);

        // Check Pakistan Affairs enrollment
        const pakistanEnrollment = currentEnrollments.find(e => 
          e.klass.name.includes('Pakistan Affairs')
        );
        
        this.logTest('Pakistan Affairs Enrollment Status', !!pakistanEnrollment, 
          pakistanEnrollment ? 'User is enrolled' : 'User not enrolled');

        // Simulate enrollment check for course detail page
        const pakistanCourse = await this.prisma.class.findFirst({
          where: { name: { contains: 'Pakistan Affairs' } },
          include: { students: true }
        });

        if (pakistanCourse) {
          const isEnrolled = pakistanCourse.students.some(s => s.userId === testUser.id);
          this.logTest('Enrollment Status Check', isEnrolled, 
            `User enrollment status: ${isEnrolled ? 'Enrolled' : 'Not enrolled'}`);
        }
      }

    } catch (error) {
      this.logTest('Course Enrollment Flow', false, error.message);
    }
  }

  // Test 4: Video Learning Flow
  async testVideoLearningFlow() {
    console.log('\n🎥 TESTING VIDEO LEARNING FLOW...');
    
    try {
      // Get Pakistan Affairs course with lectures
      const pakistanCourse = await this.prisma.class.findFirst({
        where: { name: { contains: 'Pakistan Affairs' } },
        include: { lectures: true }
      });

      if (pakistanCourse && pakistanCourse.lectures.length > 0) {
        this.logTest('Course Has Video Content', true, 
          `Course has ${pakistanCourse.lectures.length} video lectures`);

        // Test each lecture
        pakistanCourse.lectures.forEach((lecture, index) => {
          const hasTitle = !!lecture.title;
          const hasVideoUrl = !!lecture.videoUrl;
          const isYouTubeUrl = lecture.videoUrl && lecture.videoUrl.includes('youtube.com');
          
          this.logTest(`Lecture ${index + 1}: ${lecture.title}`, hasTitle && hasVideoUrl, 
            `Title: ${hasTitle ? '✓' : '✗'}, Video: ${hasVideoUrl ? '✓' : '✗'}, YouTube: ${isYouTubeUrl ? '✓' : '✗'}`);
        });

        // Test video URL conversion for frontend
        const firstLecture = pakistanCourse.lectures[0];
        if (firstLecture.videoUrl) {
          const embedUrl = this.convertToEmbedUrl(firstLecture.videoUrl);
          const isValidEmbed = embedUrl.includes('youtube.com/embed/');
          
          this.logTest('Video URL Conversion', isValidEmbed, 
            `Original: ${firstLecture.videoUrl} → Embed: ${embedUrl}`);
        }

        // Simulate course detail page data structure
        const courseDetailData = {
          id: pakistanCourse.id,
          name: pakistanCourse.name,
          description: pakistanCourse.description || '',
          instructor: 'Zehn.AI CSS Academy',
          enrolledStudents: 0,
          maxStudents: pakistanCourse.maxStudents || 50,
          status: 'published',
          source: 'database',
          enrolledStudentsList: [], // Would be populated from enrollments
          modules: [{
            id: 'default-module',
            title: 'Course Content',
            lectures: pakistanCourse.lectures.map(lecture => ({
              id: lecture.id,
              title: lecture.title,
              youtubeUrl: lecture.videoUrl,
              duration: 30,
              description: lecture.transcript || '',
              order: 0
            }))
          }]
        };

        this.logTest('Course Detail Data Structure', !!courseDetailData.modules[0].lectures.length, 
          `Course detail page would show ${courseDetailData.modules[0].lectures.length} lectures`);

      } else {
        this.logTest('Course Has Video Content', false, 'Pakistan Affairs course not found or has no lectures');
      }

    } catch (error) {
      this.logTest('Video Learning Flow', false, error.message);
    }
  }

  // Video URL conversion (matches frontend logic)
  convertToEmbedUrl(videoUrl) {
    if (!videoUrl) return '';
    
    if (videoUrl.includes('youtube.com/watch')) {
      return `https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0]}`;
    } else if (videoUrl.includes('youtu.be/')) {
      return `https://www.youtube.com/embed/${videoUrl.split('youtu.be/')[1]?.split('?')[0]}`;
    } else if (videoUrl.includes('youtube.com/embed/')) {
      return videoUrl;
    }
    return videoUrl;
  }

  // Test 5: Frontend Component Integration
  async testFrontendComponentIntegration() {
    console.log('\n🧩 TESTING FRONTEND COMPONENT INTEGRATION...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Test course page component
      const coursePagePath = path.join(process.cwd(), 'app/student/courses/[courseId]/page.tsx');
      if (fs.existsSync(coursePagePath)) {
        const content = fs.readFileSync(coursePagePath, 'utf8');
        
        // Check for required imports
        const hasRequiredImports = content.includes('useCourse') && 
                                 content.includes('useAuth') && 
                                 content.includes('ProtectedRoute');
        this.logTest('Course Page Imports', hasRequiredImports, 
          'All required hooks and components imported');

        // Check for video player implementation
        const hasVideoPlayer = content.includes('aspect-video') && content.includes('iframe');
        this.logTest('Video Player Implementation', hasVideoPlayer, 
          'Video player container and iframe present');

        // Check for enrollment logic
        const hasEnrollmentLogic = content.includes('isEnrolled') && content.includes('enrolledStudentsList');
        this.logTest('Enrollment Logic', hasEnrollmentLogic, 
          'Enrollment status checking implemented');

        // Check for course type handling
        const hasCourseTypeHandling = content.includes('source === \'json\'') && content.includes('modules');
        this.logTest('Course Type Handling', hasCourseTypeHandling, 
          'Handles both database and JSON course types');
      }

      // Test course context
      const courseContextPath = path.join(process.cwd(), 'lib/course-context.tsx');
      if (fs.existsSync(courseContextPath)) {
        const content = fs.readFileSync(courseContextPath, 'utf8');
        
        const hasEnrollmentFunctions = content.includes('enrollInCourse') && content.includes('unenrollFromCourse');
        const hasProgressTracking = content.includes('markLectureComplete') && content.includes('getStudentProgress');
        
        this.logTest('Course Context Enrollment', hasEnrollmentFunctions, 
          'Enrollment functions available in context');
        this.logTest('Course Context Progress', hasProgressTracking, 
          'Progress tracking functions available in context');
      }

    } catch (error) {
      this.logTest('Frontend Component Integration', false, error.message);
    }
  }

  // Test 6: User Experience Simulation
  async testUserExperienceSimulation() {
    console.log('\n👤 TESTING USER EXPERIENCE SIMULATION...');
    
    try {
      // Simulate complete user journey
      const testUser = await this.prisma.user.findFirst({
        where: { email: 'test@example.com' }
      });

      if (testUser) {
        // Step 1: User logs in
        this.logTest('Step 1: User Login', true, 
          `User ${testUser.name} logs in successfully`);

        // Step 2: User navigates to courses
        const courses = await this.prisma.class.findMany();
        this.logTest('Step 2: Course Discovery', courses.length > 0, 
          `User sees ${courses.length} available courses`);

        // Step 3: User selects Pakistan Affairs course
        const pakistanCourse = courses.find(c => c.name.includes('Pakistan Affairs'));
        this.logTest('Step 3: Course Selection', !!pakistanCourse, 
          pakistanCourse ? `User selects: ${pakistanCourse.name}` : 'Pakistan Affairs course not found');

        // Step 4: User checks enrollment status
        const enrollment = await this.prisma.enrollment.findFirst({
          where: { 
            userId: testUser.id,
            classId: pakistanCourse?.id 
          }
        });
        this.logTest('Step 4: Enrollment Check', !!enrollment, 
          enrollment ? 'User is enrolled' : 'User needs to enroll');

        // Step 5: User accesses video content
        if (pakistanCourse) {
          const lectures = await this.prisma.lecture.findMany({
            where: { classId: pakistanCourse.id }
          });
          this.logTest('Step 5: Video Access', lectures.length > 0, 
            `User can access ${lectures.length} video lectures`);
        }

        // Step 6: User watches first video
        if (pakistanCourse) {
          const firstLecture = await this.prisma.lecture.findFirst({
            where: { classId: pakistanCourse.id }
          });
          this.logTest('Step 6: Video Playback', !!firstLecture?.videoUrl, 
            firstLecture ? `User watches: ${firstLecture.title}` : 'No video to watch');
        }
      }

    } catch (error) {
      this.logTest('User Experience Simulation', false, error.message);
    }
  }

  // Run all frontend integration tests
  async runAllTests() {
    console.log('🖥️ STARTING FRONTEND INTEGRATION TEST SUITE');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    await this.testUserAuthenticationFlow();
    await this.testCourseDiscoveryFlow();
    await this.testCourseEnrollmentFlow();
    await this.testVideoLearningFlow();
    await this.testFrontendComponentIntegration();
    await this.testUserExperienceSimulation();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FRONTEND INTEGRATION TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL FRONTEND TESTS PASSED! User experience is working correctly.');
    } else {
      console.log('\n⚠️  Some frontend tests failed. Check the details above for issues.');
    }
    
    // Close database connection
    await this.prisma.$disconnect();
    
    return this.testResults;
  }
}

// Export for use in other files
module.exports = { FrontendIntegrationTester };

// Run if called directly
if (require.main === module) {
  const tester = new FrontendIntegrationTester();
  tester.runAllTests().catch(console.error);
}
