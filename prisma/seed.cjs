
const { PrismaClient } = require('@prisma/client'); 
const db = new PrismaClient();
async function main(){
  // Create a default center for the platform
  const center = await db.center.create({ data: { name: "Zehn.AI CSS Academy" } });
  
  // Create a sample class structure
  const klass = await db.class.create({ data: { name:"Pakistan Affairs – Cohort A", centerId:center.id } });
  
  console.log("Database seeded with initial structure ✔");
  console.log("Users must register through the proper registration form");
  console.log("No demo accounts created - users must register themselves");
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
