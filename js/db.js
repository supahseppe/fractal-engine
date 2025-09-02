import Dexie from 'dexie';

export const db = new Dexie('SnowflakeProject');

// Version 1: Initial schema with steps store
// Version 2: Added projects and characters stores
// Version 3: Add updatedAt field to characters table for better sorting and tracking
// Version 4: Add createdAt field to characters table
db.version(4).stores({
  steps: '&id, content', // Add steps table
  projects: '++id, name, summary_one_sentence, summary_one_paragraph, snowflake_steps',
  characters: '++id, projectId, name, summary, createdAt, updatedAt', // Added createdAt field
}).upgrade(async (tx) => {
  // Backfill timestamps for existing characters (if any)
  // This is a no-op on first creation because the table will be empty
  const characters = tx.table('characters');
  await characters.toCollection().modify(character => {
    // Only set timestamps if they don't already exist
    if (character.updatedAt === undefined) {
      const timestamp = Date.now();
      character.createdAt = character.createdAt || timestamp;
      character.updatedAt = timestamp;
    }
  });
});
