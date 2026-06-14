import mongoose from "mongoose";

// Support multiple common env names for the MongoDB connection string.
const MONGODB_URI =
  process.env.MONGODB_URI || process.env.URI || process.env.MONGO_URI || process.env.DATABASE_URL;
const DB_NAME = process.env.MONGODB_DB || process.env.MONGODB_DATABASE || "gamecore";

if (!MONGODB_URI) {
  throw new Error(
    "A variável de ambiente MONGODB_URI (ou URI) não está definida. Adicione MONGODB_URI no .env.local"
  );
}

/**
 * Em desenvolvimento o Next.js recarrega os módulos a cada alteração, o que
 * criaria múltiplas conexões. Guardamos a conexão em uma variável global para
 * reaproveitá-la entre hot-reloads e entre invocações de rotas.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache || { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      dbName: DB_NAME,
      bufferCommands: false,
      // serverSelectionTimeoutMS: 5000, // optional tuning
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
