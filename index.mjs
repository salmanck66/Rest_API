// index.js or app.mjs

import express from 'express';
import router from './routes/router.mjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.mjs';

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

mongoose.connect(process.env.CONNECTION_STRING, {
  dbName: 'Rest-API'
}).then(() => {
  console.log("DB Connected");
}).catch((err) => {
  console.error("Error connecting to DB:", err);
});

const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve Swagger UI static files
app.use('/swagger-ui', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));

// Set up Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static files (if needed)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Use router for API routes
app.use('/', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
