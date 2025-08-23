import { prisma } from '@/lib/prisma';

/**
 * Get or create a category by name
 */
export async function getOrCreateCategory(genre: string): Promise<string | null> {
  if (!genre) return null;
  
  try {
    const category = await prisma.category.upsert({
      where: { name: genre },
      update: {},
      create: { name: genre },
    });
    
    return category.id;
  } catch (error) {
    console.error('Error getting/creating category:', error);
    return null;
  }
}

/**
 * Migrate existing genres to categories
 */
export async function migrateGenresToCategories(): Promise<void> {
  console.log('Starting genre to category migration...');
  
  try {
    // Get all unique genres from movies
    const movies = await prisma.movie.findMany({
      select: { genre: true },
      distinct: ['genre'],
    });
    
    const genres = movies.map(m => m.genre).filter(Boolean);
    
    console.log(`Found ${genres.length} unique genres to migrate`);
    
    // Create categories for each genre
    for (const genreName of genres) {
      const category = await prisma.category.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });
      
      // Update movies with this genre to point to the category
      await prisma.movie.updateMany({
        where: { genre: genreName },
        data: { categoryId: category.id },
      });
      
      console.log(`Migrated genre "${genreName}" to category`);
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}