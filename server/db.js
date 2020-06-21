const { MongoClient } = require('mongodb');
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/";

async function connectToDB() {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = await client.db(process.env.MONGODB_URI ? null : "retro");

    // Here, we determine the TTL (time to leave) index properties
    // that will allow for automatic expiration of our documents
    db.collection("rooms").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 604800 });
    db.collection("cards").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 604800 });
    db.collection("users").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 604800 });

    console.log("📃 Database ready!");
    return db;
}

module.exports = { connectToDB };