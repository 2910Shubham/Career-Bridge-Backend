import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

app.listen(process.env.PORT || 3000, () => {
   console.log(`Server started on port ${process.env.PORT || 3000}`);
});

