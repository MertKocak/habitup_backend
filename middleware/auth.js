/* import jwt from "jsonwebtoken";

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
  }; */

  const jwt = require("jsonwebtoken");
const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

async function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token bulunamadı, yetkisiz erişim!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz token!" });
  }
}

module.exports = { authenticateUser };

