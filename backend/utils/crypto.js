// utils/crypto.js
import crypto from "crypto";

/**
 * DATA_ENC_KEY must be a base64-encoded 32-byte key (for aes-256-gcm).
 * Generate with:
 *   - openssl rand -base64 32
 *   - node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
const keyB64 = process.env.DATA_ENC_KEY;
if (!keyB64) {
  throw new Error("Missing DATA_ENC_KEY (base64-encoded 32-byte key) in environment");
}
const KEY = Buffer.from(keyB64, "base64");
if (KEY.length !== 32) {
  throw new Error("DATA_ENC_KEY must decode to exactly 32 bytes for aes-256-gcm");
}

/**
 * Encrypts UTF-8 text using AES-256-GCM with a random 96-bit IV.
 * Returns a compact string: iv.ciphertext.tag (all base64).
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${ciphertext.toString("base64")}.${tag.toString("base64")}`;
}

/**
 * Decrypts a payload produced by encrypt() into a UTF-8 string.
 */
export function decrypt(payload) {
  const [ivB64, ctB64, tagB64] = (payload || "").split(".");
  if (!ivB64 || !ctB64 || !tagB64) throw new Error("Bad ciphertext format");
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

/**
 * Constant-time string comparison to reduce timing leakage.
 */
export function safeEqual(a, b) {
  const A = Buffer.from(String(a), "utf8");
  const B = Buffer.from(String(b), "utf8");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}
