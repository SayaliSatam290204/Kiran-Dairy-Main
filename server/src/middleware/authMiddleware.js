import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("[Auth Error] No token provided in request");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // DEBUG: Log decoded token content
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth Debug] Token decoded successfully. User ID: ${decoded.id}, Role: ${decoded.role}`);
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log("[Auth Error] Token verification failed:", error.message);
    return res.status(401).json({ 
      message: "Invalid token",
      debug: error.message 
    });
  }
};