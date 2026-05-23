const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dns = require('node:dns');

// Force Node.js to use IPv4 first for DNS resolution
dns.setDefaultResultOrder('ipv4first');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found at:', envPath);
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }
});

const uri = env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log("SUCCESS: Pinged deployment successfully! Connected to MongoDB Atlas.");
  } catch (err) {
    console.error("FAILURE: Connection failed:", err);
  } finally {
    await client.close();
  }
}
run();
