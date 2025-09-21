// Simple test script to verify course management system
const { PrismaClient } = require('@prisma/client');

async function testCourses() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing course management system...');
    
    // Test 1: Check if we can fetch existing classes
    console.log('\n1. Fetching existing classes...');
    const classes = await prisma.class.findMany({
      include: {
        center: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    });
    
    console.log(`Found ${classes.length} classes:`);
    classes.forEach((cls, index) => {
      console.log(`${index + 1}. ${cls.name} (Instructor: ${cls.center?.name || 'Unknown'})`);
    });
    
    // Test 2: Check if we can fetch users
    console.log('\n2. Fetching users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Test 3: Check enrollments
    console.log('\n3. Fetching enrollments...');
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        klass: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`Found ${enrollments.length} enrollments:`);
    enrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. ${enrollment.user.name} enrolled in ${enrollment.klass.name}`);
    });
    
    console.log('\n✅ Course management system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing course management system:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCourses();
