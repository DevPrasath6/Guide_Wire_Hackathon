import mongoose from 'mongoose';

export const privateConnection = mongoose.createConnection();
export const publicConnection = mongoose.createConnection();

const defaultPrivateUri = 'mongodb://127.0.0.1:27017/earnings-shield';
const defaultPublicUri = 'mongodb://127.0.0.1:27017/es';

async function openIfNeeded(connection, uri) {
  if (connection.readyState === 1 || connection.readyState === 2) return;
  await connection.openUri(uri);
}

export async function connectDB() {
  const privateMongoUri = process.env.PRIVATE_MONGO_URI || process.env.MONGO_URI || defaultPrivateUri;
  const publicMongoUri = process.env.PUBLIC_MONGO_URI || defaultPublicUri;

  await Promise.all([openIfNeeded(privateConnection, privateMongoUri), openIfNeeded(publicConnection, publicMongoUri)]);
  console.log('MongoDB connected (private + public)');
}

export function getDbHealth() {
  return {
    privateDbConnected: privateConnection.readyState === 1,
    publicDbConnected: publicConnection.readyState === 1
  };
}
