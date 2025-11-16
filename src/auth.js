import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "adminToken";

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
  const token =
    req.cookies?.[ADMIN_COOKIE_NAME] ||
    req.headers?.authorization?.split?.(" ")[1];
  if (!token) return next();
  const payload = verifyJwt(token);
  if (payload) {
    // set AdminJS session objects
    req.session = req.session || {};
    req.session.adminUser = {
      email: payload.email,
      role: payload.role,
      id: payload.id,
    };
    req.session.admin = req.session.adminUser;
  }
  return next();
}
