import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/uni-bc/.env' });

async function promoteAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/uni-bc');
        console.log("Connected to MongoDB.");

        const email = 'meetbhesara26@gmail.com';

        // Use an anonymous schema if not registered
        const userSchema = new mongoose.Schema({
            email: String,
            isAdmin: Boolean
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: { isAdmin: true } },
            { new: true }
        );

        if (user) {
            console.log(`User ${email} promoted to admin:`, user.isAdmin);
        } else {
            console.log(`User ${email} not found.`);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

promoteAdmin();
