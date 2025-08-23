import { migrateGenresToCategories } from '@/utils/categoryUtils';
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('Starting category migration...');
  
  try {
    await migrateGenresToCategories();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}