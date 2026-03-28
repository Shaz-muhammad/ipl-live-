import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

const JWT_SECRET_FALLBACK = "dev_jwt_secret_change_me";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || JWT_SECRET_FALLBACK;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function signAdminJwt(admin) {
  const payload = { sub: admin._id.toString(), username: admin.username };
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
  return token;
}

export async function requireAdminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const admin = await Admin.findById(decoded.sub).select("username");

    if (!admin) return res.status(401).json({ error: "Admin not found" });

    req.admin = { id: admin._id.toString(), username: admin.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

