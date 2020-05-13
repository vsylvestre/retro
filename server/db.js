const { MongoClient } = require('mongodb');
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/";

async function connectToDB() {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  console.log("📃 Database ready!");
  return process.env.MONGODB_URI ? client.db() : client.db("retro");
}

module.exports = { connectToDB };