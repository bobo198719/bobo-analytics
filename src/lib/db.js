import { connectToDatabase } from './mongoose.js';

export async function getDb() {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  
  // Return a bridge that translates collection() calls to Mongoose/Native driver
  // This maintains compatibility with old getDb().collection() patterns
  return {
    collection: (name) => {
      // Native MongoDB collection from Mongoose
      return db.collection(name);
    }
  };
}
