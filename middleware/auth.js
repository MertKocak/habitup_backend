import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Kullanıcı bilgilerini sonraki işlemler için req içine ekle
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

