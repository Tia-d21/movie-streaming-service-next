import { prisma } from '@/lib/prisma';

async function migrateGenres() {
  console.log('Starting genre migration...');
  
  const movies = await prisma.movie.findMany({
    select: { genre: true },
    distinct: ['genre'],
  });
  
  const genres = movies.map(m => m.genre).filter(Boolean);
  
  for (const genreName of genres) {
    const category = await prisma.category.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });
    
    
    await prisma.movie.updateMany({
      where: { genre: genreName },
      data: { categoryId: category.id },
    });
    
    console.log(`Migrated genre "${genreName}" to category`);
  }
  
  console.log('Migration completed!');
}

migrateGenres();