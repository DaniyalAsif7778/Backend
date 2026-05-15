// import express from 'express';

// const app = express();

// const PORT = 3000;

// app.get('/', (req, res) => {
//   res.send('hellow dearn server is listening');
// });

// app.listen(PORT, (req, res) => {
//   console.log('app is listing at the 3000');
// });

import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import { DB_NAME } from './constant.js';

const app = express();

dotenv.config({
    path: './env',
});

(async () => {
    try {
        const data = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`,
        );
        console.log(
            `MongoDB connected || DB HOST : ${data.connections[0].host}`,
        );
        app.on('error', (error) => {
            console.log('error', error);
            throw error;
        });

        app.listen(process.env.PORT, (req, res) => {
            console.log('app is listening at port 8000');
        });
    } catch (error) {
        console.log('error', error);
        throw error;
    }
})();
