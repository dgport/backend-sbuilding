import express from 'express';
import dotenv from "dotenv";
import { initDatabase } from './database/db.init';
import router from './routes';
import swaggerMiddleware from "./middlewares/swagger-middleware";
import cookieParser from 'cookie-parser';
import cors from "cors"

dotenv.config();
const app = express();
const PORT = 3001;
app.use(
  cors({
    origin: [
  "http://localhost:3000", 
  "https://aisigroup.ge", 
  "https://www.aisigroup.ge",
  "https://api.aisigroup.ge"
 
],
    credentials: true, 
  
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use("/api", router);
app.use("/api", ...swaggerMiddleware);

(async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
