/**
 * SEED SCRIPT - Populate CSS syllabus topics in database
 * 
 * This script initializes the database with Pakistan Affairs syllabus topics
 * and creates course-topic mappings for existing courses.
 * 
 * Run with: node scripts/seed-syllabus.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import syllabus data
const { pakistanAffairsSyllabus } = require('../lib/syllabus/pakistan-affairs');

async function seedSyllabusTopics() {
  console.log('🌱 Seeding CSS syllabus topics...');
  
  try {
    // Seed main topics
    for (const topic of pakistanAffairsSyllabus.topics) {
      await prisma.syllabusTopic.upsert({
        where: { topicId: topic.id },
        update: {},
        create: {
          topicId: topic.id,
          subject: 'pakistan-affairs',
          title: topic.title,
          description: topic.description || null,
          parentTopicId: null,
          priority: topic.priority,
          estimatedHours: topic.estimatedHours || 2,
          orderIndex: pakistanAffairsSyllabus.topics.indexOf(topic)
        }
      });
      
      console.log(`✅ Created topic: ${topic.title}`);
      
      // Seed subtopics if any
      if (topic.subtopics) {
        for (const subtopic of topic.subtopics) {
          await prisma.syllabusTopic.upsert({
            where: { topicId: subtopic.id },
            update: {},
            create: {
              topicId: subtopic.id,
              subject: 'pakistan-affairs',
              title: subtopic.title,
              description: subtopic.description || null,
              parentTopicId: topic.id,
              priority: subtopic.priority,
              estimatedHours: subtopic.estimatedHours || 1,
              orderIndex: topic.subtopics.indexOf(subtopic)
            }
          });
          
          console.log(`  ✅ Created subtopic: ${subtopic.title}`);
        }
      }
    }
    
    // Map Pakistan Affairs courses to topics
    console.log('\n🔗 Creating course-topic mappings...');
    
    // Find Pakistan Affairs related courses
    const pakAffairsCourses = await prisma.class.findMany({
      where: {
        OR: [
          { name: { contains: 'Pakistan' } },
          { name: { contains: 'Constitutional' } },
          { description: { contains: 'Pakistan' } }
        ]
      }
    });
    
    if (pakAffairsCourses.length > 0) {
      console.log(`Found ${pakAffairsCourses.length} Pakistan Affairs related courses`);
      
      // Map each course to relevant topics
      for (const course of pakAffairsCourses) {
        // Map to constitutional topics if course mentions constitution
        if (course.name.toLowerCase().includes('constitutional')) {
          const constitutionalTopic = await prisma.syllabusTopic.findFirst({
            where: { topicId: 'pa-4' } // Constitutional Development
          });
          
          if (constitutionalTopic) {
            await prisma.courseTopicMapping.upsert({
              where: {
                classId_topicId: {
                  classId: course.id,
                  topicId: constitutionalTopic.id
                }
              },
              update: {},
              create: {
                classId: course.id,
                topicId: constitutionalTopic.id,
                coverageDepth: 'advanced'
              }
            });
            console.log(`  ✅ Mapped ${course.name} to Constitutional Development`);
          }
        }
        
        // Map general Pakistan Affairs courses to key topics
        const keyTopics = await prisma.syllabusTopic.findMany({
          where: {
            topicId: {
              in: ['pa-1', 'pa-2', 'pa-3'] // Evolution, Ideology, Movement
            }
          }
        });
        
        for (const topic of keyTopics) {
          await prisma.courseTopicMapping.upsert({
            where: {
              classId_topicId: {
                classId: course.id,
                topicId: topic.id
              }
            },
            update: {},
            create: {
              classId: course.id,
              topicId: topic.id,
              coverageDepth: 'intermediate'
            }
          });
        }
        
        console.log(`  ✅ Mapped ${course.name} to ${keyTopics.length} key topics`);
      }
    } else {
      console.log('No Pakistan Affairs courses found. Create courses first.');
    }
    
    console.log('\n✨ Syllabus seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding syllabus:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSyllabusTopics();

