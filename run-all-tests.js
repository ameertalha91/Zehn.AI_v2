/**
 * MASTER TEST RUNNER
 * 
 * This script runs all test suites for the course management system:
 * 1. Course Management Test Suite
 * 2. Video Functionality Test Suite  
 * 3. Frontend Integration Test Suite
 * 
 * Provides comprehensive testing of the entire system.
 */

const { CourseManagementTester } = require('./test-course-management');
const { VideoFunctionalityTester } = require('./test-video-functionality');
const { FrontendIntegrationTester } = require('./test-frontend-integration');

class MasterTestRunner {
  constructor() {
    this.allResults = {
      courseManagement: null,
      videoFunctionality: null,
      frontendIntegration: null,
      summary: {
        totalPassed: 0,
        totalFailed: 0,
        totalTests: 0,
        duration: 0
      }
    };
  }

  async runAllTestSuites() {
    console.log('🚀 STARTING COMPREHENSIVE COURSE MANAGEMENT SYSTEM TESTING');
    console.log('=' .repeat(80));
    console.log('This will test:');
    console.log('• Database connectivity and data integrity');
    console.log('• API endpoints and functionality');
    console.log('• Video URL validation and conversion');
    console.log('• Enrollment system');
    console.log('• Frontend component integration');
    console.log('• User experience simulation');
    console.log('• System integration points');
    console.log('=' .repeat(80));

    const overallStartTime = Date.now();

    try {
      // Run Course Management Tests
      console.log('\n📚 RUNNING COURSE MANAGEMENT TEST SUITE...');
      const courseTester = new CourseManagementTester();
      this.allResults.courseManagement = await courseTester.runAllTests();

      // Run Video Functionality Tests
      console.log('\n🎥 RUNNING VIDEO FUNCTIONALITY TEST SUITE...');
      const videoTester = new VideoFunctionalityTester();
      this.allResults.videoFunctionality = await videoTester.runAllTests();

      // Run Frontend Integration Tests
      console.log('\n🖥️ RUNNING FRONTEND INTEGRATION TEST SUITE...');
      const frontendTester = new FrontendIntegrationTester();
      this.allResults.frontendIntegration = await frontendTester.runAllTests();

      const overallEndTime = Date.now();
      this.allResults.summary.duration = ((overallEndTime - overallStartTime) / 1000).toFixed(2);

      // Calculate summary statistics
      this.calculateSummary();

      // Print comprehensive summary
      this.printComprehensiveSummary();

      return this.allResults;

    } catch (error) {
      console.error('❌ Error running test suites:', error);
      throw error;
    }
  }

  calculateSummary() {
    const suites = [
      this.allResults.courseManagement,
      this.allResults.videoFunctionality,
      this.allResults.frontendIntegration
    ];

    suites.forEach(suite => {
      if (suite) {
        this.allResults.summary.totalPassed += suite.passed;
        this.allResults.summary.totalFailed += suite.failed;
        this.allResults.summary.totalTests += suite.passed + suite.failed;
      }
    });
  }

  printComprehensiveSummary() {
    console.log('\n' + '=' .repeat(80));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('=' .repeat(80));

    // Individual suite results
    console.log('\n📚 COURSE MANAGEMENT TESTS:');
    if (this.allResults.courseManagement) {
      const cm = this.allResults.courseManagement;
      console.log(`   ✅ Passed: ${cm.passed}`);
      console.log(`   ❌ Failed: ${cm.failed}`);
      console.log(`   📈 Success Rate: ${((cm.passed / (cm.passed + cm.failed)) * 100).toFixed(1)}%`);
    }

    console.log('\n🎥 VIDEO FUNCTIONALITY TESTS:');
    if (this.allResults.videoFunctionality) {
      const vf = this.allResults.videoFunctionality;
      console.log(`   ✅ Passed: ${vf.passed}`);
      console.log(`   ❌ Failed: ${vf.failed}`);
      console.log(`   📈 Success Rate: ${((vf.passed / (vf.passed + vf.failed)) * 100).toFixed(1)}%`);
    }

    console.log('\n🖥️ FRONTEND INTEGRATION TESTS:');
    if (this.allResults.frontendIntegration) {
      const fi = this.allResults.frontendIntegration;
      console.log(`   ✅ Passed: ${fi.passed}`);
      console.log(`   ❌ Failed: ${fi.failed}`);
      console.log(`   📈 Success Rate: ${((fi.passed / (fi.passed + fi.failed)) * 100).toFixed(1)}%`);
    }

    // Overall summary
    console.log('\n' + '=' .repeat(80));
    console.log('🎯 OVERALL RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Total Passed: ${this.allResults.summary.totalPassed}`);
    console.log(`❌ Total Failed: ${this.allResults.summary.totalFailed}`);
    console.log(`📊 Total Tests: ${this.allResults.summary.totalTests}`);
    console.log(`⏱️  Total Duration: ${this.allResults.summary.duration}s`);
    console.log(`📈 Overall Success Rate: ${((this.allResults.summary.totalPassed / this.allResults.summary.totalTests) * 100).toFixed(1)}%`);

    // Final assessment
    console.log('\n' + '=' .repeat(80));
    if (this.allResults.summary.totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED! 🎉');
      console.log('✅ Course management system is fully functional');
      console.log('✅ Video functionality is working correctly');
      console.log('✅ Frontend integration is complete');
      console.log('✅ System is ready for production use');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('🔍 Review the failed tests above for issues');
      console.log('🛠️  Fix the identified problems before deployment');
    }
    console.log('=' .repeat(80));

    // Recommendations
    this.printRecommendations();
  }

  printRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.allResults.summary.totalFailed === 0) {
      console.log('• ✅ System is ready for user testing');
      console.log('• ✅ Consider adding automated testing to CI/CD pipeline');
      console.log('• ✅ Monitor system performance in production');
      console.log('• ✅ Set up error tracking and logging');
    } else {
      console.log('• 🔧 Fix all failed tests before proceeding');
      console.log('• 🧪 Re-run tests after fixes to verify');
      console.log('• 📝 Document any known issues or limitations');
      console.log('• 🚀 Consider gradual rollout after fixes');
    }

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review test results and fix any issues');
    console.log('2. Test the system manually with real user scenarios');
    console.log('3. Deploy to staging environment for further testing');
    console.log('4. Set up monitoring and error tracking');
    console.log('5. Prepare for production deployment');
  }

  // Generate test report
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.allResults.summary,
      suites: {
        courseManagement: this.allResults.courseManagement,
        videoFunctionality: this.allResults.videoFunctionality,
        frontendIntegration: this.allResults.frontendIntegration
      }
    };

    return report;
  }
}

// Main execution
async function main() {
  try {
    const runner = new MasterTestRunner();
    const results = await runner.runAllTestSuites();
    
    // Generate and save test report
    const report = runner.generateTestReport();
    const fs = require('fs');
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Test report saved to: test-report.json');
    
    // Exit with appropriate code
    process.exit(results.summary.totalFailed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MasterTestRunner };
