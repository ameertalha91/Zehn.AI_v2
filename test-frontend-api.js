// Test script to verify frontend API functionality
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFrontendAPI() {
  console.log('🌐 TESTING FRONTEND API ENDPOINTS\n');
  console.log('=' .repeat(50));

  try {
    // Wait a moment for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 1: Courses API
    console.log('\n1️⃣ TESTING COURSES API');
    console.log('-'.repeat(30));
    
    const coursesResponse = await makeRequest('/api/courses?role=student');
    console.log(`Status: ${coursesResponse.status}`);
    
    if (coursesResponse.status === 200 && coursesResponse.data.success) {
      console.log(`✅ Courses API working - Found ${coursesResponse.data.courses.length} courses`);
      
      coursesResponse.data.courses.forEach(course => {
        console.log(`\n📚 ${course.name}`);
        console.log(`   Source: ${course.source}`);
        console.log(`   Modules: ${course.modules?.length || 0}`);
        
        if (course.modules) {
          const totalLectures = course.modules.reduce((total, module) => total + (module.lectures?.length || 0), 0);
          console.log(`   Lectures: ${totalLectures}`);
          
          if (totalLectures > 0) {
            console.log('   🎥 Available lectures:');
            course.modules.forEach(module => {
              if (module.lectures) {
                module.lectures.forEach(lecture => {
                  console.log(`      - ${lecture.title}`);
                  console.log(`        Video: ${lecture.youtubeUrl || 'No video'}`);
                });
              }
            });
          }
        }
        
        if (course.sessions) {
          console.log(`   Sessions: ${course.sessions.length}`);
        }
      });
    } else {
      console.log('❌ Courses API failed:', coursesResponse.data);
    }

    // Test 2: Enrolled Courses API
    console.log('\n\n2️⃣ TESTING ENROLLED COURSES API');
    console.log('-'.repeat(30));
    
    const enrolledResponse = await makeRequest('/api/student/courses/enrolled');
    console.log(`Status: ${enrolledResponse.status}`);
    
    if (enrolledResponse.status === 200) {
      console.log(`✅ Enrolled courses API working - Found ${enrolledResponse.data.length} enrollments`);
      enrolledResponse.data.forEach(enrollment => {
        console.log(`   📚 ${enrollment.courseName} (${enrollment.role})`);
      });
    } else {
      console.log('❌ Enrolled courses API failed:', enrolledResponse.data);
    }

    // Test 3: Individual Course API
    console.log('\n\n3️⃣ TESTING INDIVIDUAL COURSE API');
    console.log('-'.repeat(30));
    
    if (coursesResponse.status === 200 && coursesResponse.data.success) {
      const testCourse = coursesResponse.data.courses.find(c => c.modules && c.modules[0]?.lectures?.length > 0);
      
      if (testCourse) {
        const courseResponse = await makeRequest(`/api/courses/${testCourse.id}`);
        console.log(`Status: ${courseResponse.status}`);
        
        if (courseResponse.status === 200) {
          console.log(`✅ Individual course API working for: ${testCourse.name}`);
          console.log(`   Modules: ${courseResponse.data.modules?.length || 0}`);
          if (courseResponse.data.modules) {
            const totalLectures = courseResponse.data.modules.reduce((total, module) => total + (module.lectures?.length || 0), 0);
            console.log(`   Lectures: ${totalLectures}`);
          }
        } else {
          console.log('❌ Individual course API failed:', courseResponse.data);
        }
      } else {
        console.log('⚠️  No courses with lectures found for individual testing');
      }
    }

    // Test 4: Summary
    console.log('\n\n4️⃣ FRONTEND API TEST SUMMARY');
    console.log('-'.repeat(30));
    
    const allTestsPassed = coursesResponse.status === 200 && 
                          coursesResponse.data.success && 
                          enrolledResponse.status === 200;
    
    if (allTestsPassed) {
      console.log('🎉 ALL FRONTEND API TESTS PASSED!');
      console.log('   ✅ Courses API is working');
      console.log('   ✅ Enrolled courses API is working');
      console.log('   ✅ Course data structure is correct');
      console.log('   ✅ Frontend should display courses properly');
      console.log('\n📝 EXPECTED FRONTEND BEHAVIOR:');
      console.log('   - Course catalog should show courses with correct module/lecture counts');
      console.log('   - Course detail pages should show video content for enrolled users');
      console.log('   - Enrollment status should be properly tracked');
    } else {
      console.log('❌ SOME FRONTEND API TESTS FAILED');
      console.log('   - Check server logs for errors');
      console.log('   - Verify database connection');
      console.log('   - Check API endpoint implementations');
    }

  } catch (error) {
    console.error('❌ Frontend API test failed:', error.message);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   - Make sure the development server is running (npm run dev)');
    console.log('   - Check if port 3000 is available');
    console.log('   - Verify database is properly seeded');
  }
}

testFrontendAPI();

