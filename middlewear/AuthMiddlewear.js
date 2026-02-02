import jwt from "jsonwebtoken";
import Constant from "../Constant.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const Authorization = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: Constant.TOKENNOT || "Token missing or invalid." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        const expiredToken = jwt.decode(token);
        return res.status(401).json({
          message: "Token expired. Please log in again.",
          status: 401,
          expiredAt: err.expiredAt,
          payload: expiredToken,
        });
      }
      return res.status(401).json({
        message: "Invalid token. Unauthorized!",
        status: 401,
      });
      
    }
     req.user = decodedToken; 
    next();
  });
};
