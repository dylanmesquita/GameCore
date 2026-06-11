import mongoose from "mongoose";

const URI = process.env.URI;
const DB_NAME = process.env.MONGODB_DB || "gamecore";

if (!URI) {
  throw new Error(
    "A variável de ambiente URI (string de conexão do MongoDB) não está definida no .env"
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
    cached.promise = mongoose.connect(URI as string, {
      dbName: DB_NAME,
      bufferCommands: false,
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
