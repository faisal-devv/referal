const mongoose = require('mongoose');

// Cache the connection to avoid multiple connections in serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // readyState 1 = connected; if the cached connection is stale, fall through and reconnect
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }
  if (cached.conn && cached.conn.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set. Add it to your .env file.');
    }

    const opts = {
      bufferCommands: false
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Database connection error:', e.message);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
