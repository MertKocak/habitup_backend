import jwt from "jsonwebtoken";

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

