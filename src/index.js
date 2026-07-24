import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app.js';
import { DB_NAME } from './constant.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({
	path: './.env',
});

(async () => {
    try {
        const data = await mongoose.connect(
            `${process.env.MONGODB_URI}${DB_NAME}`
        )

         console.log(
            `MongoDB connected || DB HOST : ${data}`,
        );
        app.on('error', (error) => {
            console.log('error', error);
            throw error;
        });

        app.listen(process.env.PORT, (req, res) => {
            console.log(`app is listening at port  ${process.env.PORT}`);
        });
    } catch (error) {
        console.log('error', error);
        throw error;
    }
})();
