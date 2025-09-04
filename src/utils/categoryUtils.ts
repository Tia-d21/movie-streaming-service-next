import { prisma } from "lib/prisma";

export async function getOrCreateCategory(
  genre: string
): Promise<string | null> {
  // This function is already correct.
  if (!genre) return null;

  try {
    const category = await prisma.category.upsert({
      where: { name: genre },
      update: {},
      create: { name: genre },
    });

    return category.id;
  } catch (error) {
    console.error("Error getting/creating category:", error);
    return null;
  }
}

export async function migrateGenresToCategories(): Promise<void> {
  console.log("Starting genre to category migration...");

  try {
    const movies = await prisma.movie.findMany({
      select: { genre: true },
      distinct: ["genre"],
    });

    // --- [FIX] Use an explicit type guard to filter out nulls safely ---
    // This tells TypeScript that the resulting array will ONLY contain strings.
    const genres: string[] = movies
      .map((m) => m.genre)
      .filter(
        (genre): genre is string => genre !== null && genre !== undefined
      );

    console.log(`Found ${genres.length} unique genres to migrate`);

    for (const genreName of genres) {
      // Now, TypeScript knows `genreName` is guaranteed to be a string, so there are no errors.
      const category = await prisma.category.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });

      // No error here either.
      await prisma.movie.updateMany({
        where: { genre: genreName },
        data: { categoryId: category.id },
      });

      console.log(`Migrated genre "${genreName}" to category`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
