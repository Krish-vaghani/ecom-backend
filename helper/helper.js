import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const saltRound = 10

// CORS configuration (works with localtunnel and localhost)
export const corsOptions = {
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      origin === 'null' ||
      /^https?:\/\/localhost(:\d+)?$/i.test(origin) ||
      /\.loca\.lt$/i.test(origin) ||
      /\.ngrok/i.test(origin);
    callback(null, allowed);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Requested-With',
    'bypass-tunnel-reminder',
    'Access-Control-Allow-Headers'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

// Create middleware function
export const setupCors = (app) => {
  // CORS middleware handles preflight requests automatically
  app.use(cors(corsOptions));
}

export const GenerateToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
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