/**
 * VIDEO FUNCTIONALITY TEST SUITE
 * 
 * This test specifically focuses on video-related functionality:
 * - Video URL validation and conversion
 * - YouTube embedding logic
 * - Video player component integration
 * - Course video data structure
 * - Frontend video rendering
 */

const { PrismaClient } = require('@prisma/client');

class VideoFunctionalityTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
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

  // Test 1: Video URL Format Validation
  async testVideoURLFormats() {
    console.log('\n🎥 TESTING VIDEO URL FORMATS...');
    
    const testUrls = [
      {
        input: 'https://www.youtube.com/watch?v=YDfyHLPhRVU',
        expected: 'https://www.youtube.com/embed/YDfyHLPhRVU',
        description: 'Standard YouTube watch URL'
      },
      {
        input: 'https://youtu.be/YDfyHLPhRVU',
        expected: 'https://www.youtube.com/embed/YDfyHLPhRVU',
        description: 'YouTube short URL'
      },
      {
        input: 'https://www.youtube.com/embed/YDfyHLPhRVU',
        expected: 'https://www.youtube.com/embed/YDfyHLPhRVU',
        description: 'Already embedded URL'
      },
      {
        input: 'https://www.youtube.com/watch?v=YDfyHLPhRVU&t=30s',
        expected: 'https://www.youtube.com/embed/YDfyHLPhRVU',
        description: 'YouTube URL with timestamp'
      }
    ];

    testUrls.forEach(test => {
      const converted = this.convertToEmbedUrl(test.input);
      const passed = converted === test.expected;
      this.logTest(`URL Conversion - ${test.description}`, passed, 
        `Input: ${test.input} → Output: ${converted}`);
    });
  }

  // Video URL conversion logic (matches frontend implementation)
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

  // Test 2: Database Video Data
  async testDatabaseVideoData() {
    console.log('\n💾 TESTING DATABASE VIDEO DATA...');
    
    try {
      const lectures = await this.prisma.lecture.findMany({
        include: { klass: true }
      });

      this.logTest('Lectures Found', lectures.length > 0, 
        `Found ${lectures.length} lectures in database`);

      // Test each lecture
      lectures.forEach(lecture => {
        const hasTitle = !!lecture.title;
        const hasVideoUrl = !!lecture.videoUrl;
        const isYouTubeUrl = lecture.videoUrl && lecture.videoUrl.includes('youtube.com');
        
        this.logTest(`Lecture: ${lecture.title}`, hasTitle && hasVideoUrl, 
          `Title: ${hasTitle ? '✓' : '✗'}, Video URL: ${hasVideoUrl ? '✓' : '✗'}`);
        
        this.logTest(`YouTube URL: ${lecture.title}`, isYouTubeUrl, 
          `URL: ${lecture.videoUrl ? lecture.videoUrl.substring(0, 50) + '...' : 'None'}`);
      });

      // Test Pakistan Affairs course specifically
      const pakistanLectures = lectures.filter(l => 
        l.klass.name.includes('Pakistan Affairs')
      );
      
      this.logTest('Pakistan Affairs Lectures', pakistanLectures.length >= 3, 
        `Found ${pakistanLectures.length} lectures (expected ≥3)`);

    } catch (error) {
      this.logTest('Database Video Data', false, error.message);
    }
  }

  // Test 3: Video Player Component Integration
  async testVideoPlayerIntegration() {
    console.log('\n🖥️ TESTING VIDEO PLAYER INTEGRATION...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check if video player component exists
      const videoComponentPath = path.join(process.cwd(), 'components/VideoQuizComponent.tsx');
      const componentExists = fs.existsSync(videoComponentPath);
      this.logTest('Video Component Exists', componentExists, 
        componentExists ? 'VideoQuizComponent.tsx found' : 'Component not found');

      if (componentExists) {
        const content = fs.readFileSync(videoComponentPath, 'utf8');
        
        // Check for key video functionality
        const hasVideoProps = content.includes('videoId') || content.includes('videoUrl');
        const hasIframe = content.includes('<iframe') || content.includes('iframe');
        const hasYouTube = content.includes('youtube.com/embed');
        
        this.logTest('Video Component Props', hasVideoProps, 
          'Component accepts video properties');
        this.logTest('Video Component Iframe', hasIframe, 
          'Component uses iframe for video embedding');
        this.logTest('Video Component YouTube', hasYouTube, 
          'Component supports YouTube embedding');
      }

      // Check course page video integration
      const coursePagePath = path.join(process.cwd(), 'app/student/courses/[courseId]/page.tsx');
      if (fs.existsSync(coursePagePath)) {
        const content = fs.readFileSync(coursePagePath, 'utf8');
        
        const hasVideoPlayer = content.includes('aspect-video') || content.includes('iframe');
        const hasVideoUrl = content.includes('youtubeUrl') || content.includes('videoUrl');
        const hasVideoEmbedding = content.includes('youtube.com/embed');
        
        this.logTest('Course Page Video Player', hasVideoPlayer, 
          'Course page has video player container');
        this.logTest('Course Page Video URL', hasVideoUrl, 
          'Course page handles video URLs');
        this.logTest('Course Page Video Embedding', hasVideoEmbedding, 
          'Course page supports video embedding');
      }

    } catch (error) {
      this.logTest('Video Player Integration', false, error.message);
    }
  }

  // Test 4: Video Data Flow
  async testVideoDataFlow() {
    console.log('\n🔄 TESTING VIDEO DATA FLOW...');
    
    try {
      // Test complete data flow from database to frontend
      const courses = await this.prisma.class.findMany({
        include: { 
          lectures: true,
          center: true
        }
      });

      if (courses.length > 0) {
        const course = courses[0];
        
        // Simulate API response structure
        const apiResponse = {
          id: course.id,
          name: course.name,
          description: course.description || '',
          instructor: course.center?.name || 'Unknown',
          instructorId: course.centerId,
          enrolledStudents: 0,
          maxStudents: course.maxStudents || 50,
          status: 'published',
          source: 'database',
          modules: [{
            id: 'default-module',
            title: 'Course Content',
            lectures: (course.lectures || []).map(lecture => ({
              id: lecture.id,
              title: lecture.title,
              youtubeUrl: lecture.videoUrl, // This is the key mapping
              duration: 30,
              description: lecture.transcript || '',
              order: 0
            }))
          }]
        };

        // Test API response structure
        const hasRequiredFields = apiResponse.id && apiResponse.name && apiResponse.modules;
        this.logTest('API Response Structure', hasRequiredFields, 
          'API response has required fields');

        // Test lecture mapping
        if (apiResponse.modules[0].lectures.length > 0) {
          const lecture = apiResponse.modules[0].lectures[0];
          const hasLectureFields = lecture.id && lecture.title && lecture.youtubeUrl;
          this.logTest('Lecture Mapping', hasLectureFields, 
            'Lectures properly mapped with youtubeUrl field');
        }

        // Test video URL conversion in data flow
        const lectures = apiResponse.modules[0].lectures;
        const validVideoUrls = lectures.filter(lecture => 
          lecture.youtubeUrl && this.convertToEmbedUrl(lecture.youtubeUrl).includes('youtube.com/embed')
        );
        
        this.logTest('Video URL Conversion Flow', validVideoUrls.length === lectures.length, 
          `${validVideoUrls.length}/${lectures.length} video URLs can be converted to embed format`);
      }

    } catch (error) {
      this.logTest('Video Data Flow', false, error.message);
    }
  }

  // Test 5: Video Accessibility
  async testVideoAccessibility() {
    console.log('\n♿ TESTING VIDEO ACCESSIBILITY...');
    
    try {
      const lectures = await this.prisma.lecture.findMany();
      
      // Test video accessibility features
      lectures.forEach(lecture => {
        const hasTitle = !!lecture.title;
        const hasDescription = !!lecture.transcript;
        const hasVideoUrl = !!lecture.videoUrl;
        
        this.logTest(`Accessibility - ${lecture.title}`, hasTitle && hasVideoUrl, 
          `Title: ${hasTitle ? '✓' : '✗'}, Description: ${hasDescription ? '✓' : '✗'}, Video: ${hasVideoUrl ? '✓' : '✗'}`);
      });

      // Test iframe accessibility attributes
      const fs = require('fs');
      const path = require('path');
      const coursePagePath = path.join(process.cwd(), 'app/student/courses/[courseId]/page.tsx');
      
      if (fs.existsSync(coursePagePath)) {
        const content = fs.readFileSync(coursePagePath, 'utf8');
        const hasTitleAttribute = content.includes('title=');
        const hasAllowFullScreen = content.includes('allowFullScreen');
        
        this.logTest('Iframe Title Attribute', hasTitleAttribute, 
          'Video iframe has title attribute for accessibility');
        this.logTest('Iframe Fullscreen Support', hasAllowFullScreen, 
          'Video iframe supports fullscreen mode');
      }

    } catch (error) {
      this.logTest('Video Accessibility', false, error.message);
    }
  }

  // Test 6: Video Performance
  async testVideoPerformance() {
    console.log('\n⚡ TESTING VIDEO PERFORMANCE...');
    
    try {
      const lectures = await this.prisma.lecture.findMany();
      
      // Test video loading performance considerations
      lectures.forEach(lecture => {
        const isYouTubeUrl = lecture.videoUrl && lecture.videoUrl.includes('youtube.com');
        const isEmbedUrl = lecture.videoUrl && lecture.videoUrl.includes('youtube.com/embed');
        
        this.logTest(`Performance - ${lecture.title}`, isYouTubeUrl, 
          `YouTube URL: ${isYouTubeUrl ? '✓' : '✗'}, Embed Ready: ${isEmbedUrl ? '✓' : '✗'}`);
      });

      // Test lazy loading implementation
      const fs = require('fs');
      const path = require('path');
      const coursePagePath = path.join(process.cwd(), 'app/student/courses/[courseId]/page.tsx');
      
      if (fs.existsSync(coursePagePath)) {
        const content = fs.readFileSync(coursePagePath, 'utf8');
        const hasLazyLoading = content.includes('loading=') || content.includes('lazy');
        
        this.logTest('Video Lazy Loading', hasLazyLoading, 
          hasLazyLoading ? 'Video loading is optimized' : 'No lazy loading detected');
      }

    } catch (error) {
      this.logTest('Video Performance', false, error.message);
    }
  }

  // Run all video tests
  async runAllTests() {
    console.log('🎬 STARTING VIDEO FUNCTIONALITY TEST SUITE');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    await this.testVideoURLFormats();
    await this.testDatabaseVideoData();
    await this.testVideoPlayerIntegration();
    await this.testVideoDataFlow();
    await this.testVideoAccessibility();
    await this.testVideoPerformance();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 VIDEO TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL VIDEO TESTS PASSED! Video functionality is working correctly.');
    } else {
      console.log('\n⚠️  Some video tests failed. Check the details above for issues.');
    }
    
    // Close database connection
    await this.prisma.$disconnect();
    
    return this.testResults;
  }
}

// Export for use in other files
module.exports = { VideoFunctionalityTester };

// Run if called directly
if (require.main === module) {
  const tester = new VideoFunctionalityTester();
  tester.runAllTests().catch(console.error);
}
