/**
 * DATABASE MIGRATION SCRIPT - Moves data from JSON files to Prisma database
 * 
 * PURPOSE:
 * This script migrates video and assignment data from JSON file storage to the 
 * proper Prisma database. This fixes the data storage inconsistency where some
 * data was stored in files and some in the database.
 * 
 * WHAT THIS SCRIPT DOES:
 * 1. Reads existing data from JSON files (data/videos.json, data/assignments.json)
 * 2. Transforms data to match Prisma database models
 * 3. Inserts data into SQLite database using Prisma client
 * 4. Creates backup copies of original JSON files
 * 
 * RELATED MODULES TO UNDERSTAND:
 * - /prisma/schema.prisma - Database structure definitions
 * - /lib/db.ts - Prisma client connection
 * - /data/videos.json - Source video data (will be migrated)
 * - /data/assignments.json - Source assignment data (will be migrated)
 * - /app/api/assignments/route.ts - Will be updated to use database after this
 * - /app/api/admin/videos/route.ts - Video API that should use database
 * 
 * HOW TO RUN:
 * node scripts/migrate-to-database.js
 * 
 * ARCHITECTURE NOTE:
 * After this migration, all data will be stored consistently in the database,
 * making queries faster, data relationships possible, and eliminating race
 * conditions from file-based storage.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * UTILITY FUNCTIONS
 * Helper functions for file operations and data transformation
 */

// Create backup of original JSON files before migration
function createBackups() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'data', 'backups', timestamp);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const filesToBackup = ['videos.json', 'assignments.json', 'submissions.json'];
  
  filesToBackup.forEach(file => {
    const sourcePath = path.join(process.cwd(), 'data', file);
    const backupPath = path.join(backupDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, backupPath);
      console.log(`✅ Backed up ${file} to ${backupPath}`);
    }
  });
  
  return backupDir;
}

// Read JSON file safely with error handling
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

/**
 * VIDEO MIGRATION FUNCTIONS
 * Migrate videos from JSON file to Video model in database
 */

async function migrateVideos() {
  console.log('\n🎥 Starting video migration...');
  
  const videosPath = path.join(process.cwd(), 'data', 'videos.json');
  const videos = readJsonFile(videosPath);
  
  if (videos.length === 0) {
    console.log('📝 No videos found to migrate');
    return;
  }
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const video of videos) {
    try {
      // Check if video already exists in database
      const existingVideo = await prisma.video.findUnique({
        where: { youtubeId: video.id }
      });
      
      if (existingVideo) {
        console.log(`⏭️  Skipping video "${video.title}" - already exists in database`);
        skippedCount++;
        continue;
      }
      
      // Transform JSON structure to match database model
      const videoData = {
        youtubeId: video.id,
        title: video.title || 'Untitled Video',
        keywords: JSON.stringify({
          subject: video.subject || '',
          instructor: video.instructor || '',
          description: video.description || ''
        })
      };
      
      // Insert video into database
      await prisma.video.create({
        data: videoData
      });
      
      console.log(`✅ Migrated video: "${video.title}"`);
      migratedCount++;
      
    } catch (error) {
      console.error(`❌ Error migrating video "${video.title}":`, error.message);
    }
  }
  
  console.log(`\n📊 Video migration complete:`);
  console.log(`   - Migrated: ${migratedCount} videos`);
  console.log(`   - Skipped: ${skippedCount} videos (already existed)`);
}

/**
 * ASSIGNMENT MIGRATION FUNCTIONS
 * Migrate assignments and submissions from JSON files to Assignment/AssignmentSubmission models
 */

async function migrateAssignments() {
  console.log('\n📚 Starting assignment migration...');
  
  const assignmentsPath = path.join(process.cwd(), 'data', 'assignments.json');
  const assignments = readJsonFile(assignmentsPath);
  
  if (assignments.length === 0) {
    console.log('📝 No assignments found to migrate');
    return;
  }
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const assignment of assignments) {
    try {
      // Check if assignment already exists (by title and classId)
      const existingAssignment = await prisma.assignment.findFirst({
        where: {
          title: assignment.title,
          classId: assignment.classId
        }
      });
      
      if (existingAssignment) {
        console.log(`⏭️  Skipping assignment "${assignment.title}" - already exists`);
        skippedCount++;
        continue;
      }
      
      // Transform JSON structure to match database model
      const assignmentData = {
        title: assignment.title,
        description: assignment.description || '',
        classId: assignment.classId,
        createdBy: assignment.createdBy,
        dueDate: new Date(assignment.dueDate),
        maxPoints: assignment.maxPoints || 100
      };
      
      // Insert assignment into database
      await prisma.assignment.create({
        data: assignmentData
      });
      
      console.log(`✅ Migrated assignment: "${assignment.title}"`);
      migratedCount++;
      
    } catch (error) {
      console.error(`❌ Error migrating assignment "${assignment.title}":`, error.message);
    }
  }
  
  console.log(`\n📊 Assignment migration complete:`);
  console.log(`   - Migrated: ${migratedCount} assignments`);
  console.log(`   - Skipped: ${skippedCount} assignments (already existed)`);
}

async function migrateSubmissions() {
  console.log('\n📄 Starting submission migration...');
  
  const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json');
  const submissions = readJsonFile(submissionsPath);
  
  if (submissions.length === 0) {
    console.log('📝 No submissions found to migrate');
    return;
  }
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const submission of submissions) {
    try {
      // Find the corresponding assignment in the database
      const assignment = await prisma.assignment.findFirst({
        where: { id: submission.assignmentId }
      });
      
      if (!assignment) {
        console.log(`⚠️  Skipping submission - assignment ID ${submission.assignmentId} not found in database`);
        continue;
      }
      
      // Check if submission already exists
      const existingSubmission = await prisma.assignmentSubmission.findFirst({
        where: {
          assignmentId: submission.assignmentId,
          studentId: submission.studentId
        }
      });
      
      if (existingSubmission) {
        console.log(`⏭️  Skipping submission - already exists for student ${submission.studentId}`);
        skippedCount++;
        continue;
      }
      
      // Create submission data
      const submissionData = {
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        filePath: submission.filePath,
        fileName: submission.fileName,
        fileSize: submission.fileSize,
        extractedText: submission.extractedText,
        status: submission.status || 'SUBMITTED',
        submittedAt: new Date(submission.submittedAt)
      };
      
      // Insert submission into database
      const createdSubmission = await prisma.assignmentSubmission.create({
        data: submissionData
      });
      
      // If there's feedback, create feedback record
      if (submission.feedback) {
        await prisma.assignmentFeedback.create({
          data: {
            submissionId: createdSubmission.id,
            teacherId: submission.feedback.teacherId,
            grade: submission.feedback.grade,
            comments: submission.feedback.comments
          }
        });
      }
      
      console.log(`✅ Migrated submission for student: ${submission.studentId}`);
      migratedCount++;
      
    } catch (error) {
      console.error(`❌ Error migrating submission:`, error.message);
    }
  }
  
  console.log(`\n📊 Submission migration complete:`);
  console.log(`   - Migrated: ${migratedCount} submissions`);
  console.log(`   - Skipped: ${skippedCount} submissions (already existed)`);
}

/**
 * MAIN MIGRATION FUNCTION
 * Orchestrates the entire migration process
 */

async function runMigration() {
  console.log('🚀 Starting database migration...');
  console.log('This will move data from JSON files to the database\n');
  
  try {
    // Step 1: Create backups of existing data
    console.log('📁 Creating backups...');
    const backupDir = createBackups();
    console.log(`✅ Backups created in: ${backupDir}`);
    
    // Step 2: Migrate videos
    await migrateVideos();
    
    // Step 3: Migrate assignments
    await migrateAssignments();
    
    // Step 4: Migrate submissions
    await migrateSubmissions();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the application to ensure everything works');
    console.log('2. Update API routes to use Prisma instead of JSON files');
    console.log('3. Remove JSON file dependencies from the code');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check that the database is running');
    console.log('2. Verify Prisma schema is up to date');
    console.log('3. Ensure JSON files exist and are valid');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };