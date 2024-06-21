import express from 'express';
import router from './routes/router.mjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

dotenv.config();

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

mongoose.connect(process.env.CONNECTION_STRING,{
  dbName:'Rest-API'
}).then(() => {
  console.log("DB Connected");
}).catch((err) => {
  console.error("Error connecting to DB:", err);
});

const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve static files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve uploaded files from the uploads folder inside public
app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use('/', router);
