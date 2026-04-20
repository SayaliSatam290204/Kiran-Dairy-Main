// server.js
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { PORT } from "./src/config/env.js";

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();