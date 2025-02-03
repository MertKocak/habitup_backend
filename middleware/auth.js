import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("authenticateUser: " + token)
  
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided. ERROR" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Kullanıcı bilgilerini req içine ekle
      next();
    } catch (error) {
      console.error(error);  // Hata logu
      res.status(401).json({ error: "Invalid token or token expired" });
    }
  };

