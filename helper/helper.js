import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const saltRound = 10

// CORS configuration – allow all origins, methods, and headers
export const corsOptions = {
  origin: true, // allow any origin (reflects request origin)
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: true,
  optionsSuccessStatus: 200
}

// Create middleware function
export const setupCors = (app) => {
  // CORS middleware handles preflight requests automatically
  app.use(cors(corsOptions));
}

export const GenerateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const GenerateAdminToken = (adminId) => {
  return jwt.sign(
    { id: adminId, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const hashpassword = async (password) => {
  const hash = await bcrypt.hash(password, saltRound);
  return hash;
}

export const comparepassword = async(password, hashpassword) => {
  const hash = await bcrypt.compare(password, hashpassword);
  return hash;
}