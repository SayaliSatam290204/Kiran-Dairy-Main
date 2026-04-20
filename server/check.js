import connectDB from "./src/config/db.js";
import User from "./src/models/User.js";

const check = async () => {
    try {
        await connectDB();
        const users = await User.find({});
        console.log("Users in DB:");
        console.log(users);
        process.exit(0);
    } catch(err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
check();
