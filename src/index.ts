import express from 'express';
import { uploadFile } from './controllers/files'
import AWS from 'aws-sdk';
import dotenv from 'dotenv'

dotenv.config()

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const app = express();
const PORT = 3000;

app.post("/:file_name", uploadFile)

app.listen(PORT, () => {
  console.log(`[server]: Server is running at https://localhost:${PORT}`);
})
