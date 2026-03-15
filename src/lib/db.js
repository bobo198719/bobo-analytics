import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'bobo_analytics';

let client;
let db;

// Fallback to local JSON for development/debug if MONGODB_URI is not set
const localDbPath = path.join(process.cwd(), 'src/data/db.json');

export async function getDb() {
  if (MONGODB_URI) {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
    }
    return client.db(DB_NAME);
  } else {
    // Return a mocked-up DB object that interacts with the local file
    return {
      collection: (name) => ({
        find: (query) => ({
          toArray: async () => {
            const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
            return (data[name] || []).filter(item => {
              return Object.entries(query).every(([k, v]) => item[k] === v);
            });
          },
        }),
        findOne: async (query) => {
            const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
            return (data[name] || []).find(item => {
              return Object.entries(query).every(([k, v]) => item[k] === v);
            });
        },
        insertOne: async (doc) => {
          const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          if (!data[name]) data[name] = [];
          data[name].push(doc);
          fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
          return { insertedId: doc._id || doc.id };
        },
        updateOne: async (query, update, options = {}) => {
           const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
           const index = (data[name] || []).findIndex(item => {
             return Object.entries(query).every(([k, v]) => item[k] === v);
           });
           
           if (index !== -1) {
             const set = update.$set || update;
             data[name][index] = { ...data[name][index], ...set };
             fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
             return { modifiedCount: 1 };
           } else if (options.upsert) {
             const set = update.$set || update;
             // For upsert, we combine query and set
             const newDoc = { ...query, ...set };
             if (!data[name]) data[name] = [];
             data[name].push(newDoc);
             fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
             return { upsertedCount: 1, upsertedId: newDoc.id };
           }
           return { modifiedCount: 0 };
        },
        deleteOne: async (query) => {
          const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          const initialLength = (data[name] || []).length;
          data[name] = (data[name] || []).filter(item => {
            return !Object.entries(query).every(([k, v]) => item[k] === v);
          });
          fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
          return { deletedCount: initialLength - data[name].length };
        }
      })
    };
  }
}
