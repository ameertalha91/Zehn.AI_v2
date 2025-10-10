// Quick script to view your account details
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function viewYourAccount() {
  try {
    // Find your specific account
    const yourAccount = await db.user.findUnique({
      where: {
        email: 'ali_syed_bok@live.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // This will show the hashed password
        role: true,
        centerId: true,
        createdAt: true,
      }
    });

    if (yourAccount) {
      console.log('\n🔍 YOUR ACCOUNT DETAILS:');
      console.log('========================');
      console.log('ID:', yourAccount.id);
      console.log('Name:', yourAccount.name);
      console.log('Email:', yourAccount.email);
      console.log('Role:', yourAccount.role);
      console.log('Center ID:', yourAccount.centerId || 'None');
      console.log('Created:', yourAccount.createdAt);
      console.log('Password Hash:', yourAccount.password.substring(0, 20) + '...');
      console.log('Hash Length:', yourAccount.password.length, 'characters');
      console.log('========================\n');
    } else {
      console.log('❌ Account not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

viewYourAccount();





