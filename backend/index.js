//to start the server, run the following command in the terminal from the backend folder: npm run index

import express from 'express';
import cors from 'cors';
import "dotenv/config";
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';

import authRoute from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 5000;
connectDB();
const allowedOrigins = ["http://localhost:5173"]


app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins ,credentials:true}));


//api endpoints

app.get('/', (req, res) => {
    res.send('Hello World fazal');
});

app.use('/api/auth', authRoute);
app.use('/api/user', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});