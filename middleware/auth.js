import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    console.log("Authorization Header:", req.headers['authorization']); // Header'ı kontrol et
    const token = req.header("Authorization")?.replace("Bearer ", "");
  
    console.log("authenticateUser Token: ", token);  // Token'ı burada tekrar kontrol et
    
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Kullanıcı bilgilerini req içine ekle
      next();
    } catch (error) {
      console.error("JWT Error:", error);  // Hata logu
      res.status(401).json({ error: "Invalid token or token expired" });
    }
  };

