import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
export const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "adminToken";

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function adminJwtMiddleware(req, res, next) {
  console.log("JWT Middleware - Path:", req.path);
  const token =
    req.cookies?.[ADMIN_COOKIE_NAME] ||
    req.headers?.authorization?.split?.(" ")[1];

  if (!token) {
    console.log("No token found in cookies or headers");
    return next();
  }

  console.log("Token found, verifying...");
  const payload = verifyJwt(token);

  if (payload) {
    console.log("Token valid - User:", payload.email, "Role:", payload.role);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
  } else {
    console.log("Token verification failed");
  }

  next();
}
