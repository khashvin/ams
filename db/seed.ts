import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/schema';

async function seed() {
  try {
    const sqlite = new Database('sqlite.db');
    const db = drizzle(sqlite, { schema });

    const data: schema.NewSlot[] = [
      {
        dateTime: '2024-04-04 10:00:00',
        availableSlots: 1,
      },
      {
        dateTime: '2024-04-04 10:30:00',
        availableSlots: 1,
      },
      {
        dateTime: '2024-04-04 11:00:00',
        availableSlots: 0,
      },
    ];

    const result = await db.insert(schema.slots).values(data);
    console.log('Seeded the database', result);
  } catch (error) {
    console.error('Error seeding the database', error);
  }
}

seed();