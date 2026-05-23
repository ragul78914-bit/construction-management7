import { MongoClient } from 'mongodb';
import dns from 'node:dns';

// Force Node.js to resolve IPv4 first (fixes querySrv ECONNREFUSED in many local environments)
dns.setDefaultResultOrder('ipv4first');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Failed to set public DNS resolvers:', e.message);
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the MongoClient
  // is not repeatedly created during hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  return client.db(); // Uses the 'monex' db specified in the URI
}

export async function getCollection(name) {
  const db = await getDatabase();
  return db.collection(name);
}
