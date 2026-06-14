import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDB from './db/connect';
import app from './app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'config.env') });

process.on('uncaughtException', (err: any) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

let server: import('http').Server | undefined;

await connectDB();

const port = process.env.PORT || 3000;
server = app.listen(port, () => {
  console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode`);
});
