import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';
import { User } from './models/user.model';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

async function adminExists() {
    try {
        const email = "khalasa.admin@gmail.com";
        const pw = "khalasa.admin@1111"
        const adminExists = await User.findOne({ role: 'super_admin' });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(pw, 12);

            await User.create({
                username: 'System Admin',
                email: email,
                password: hashedPassword,
                role: 'super_admin',
                verifyed: true
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error ensuring admin exists:', error);
    }
}

mongoose.connect(MONGO_URI).then(async () => {
    console.log('MongoDB connected.');
    await adminExists()
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
