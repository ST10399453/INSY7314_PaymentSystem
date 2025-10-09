import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss";

export function applySecurity(app) {
  // --- Helmet: adds various HTTP headers for security ---
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],           // Prevent XSS / data injection
          "script-src": ["'self'"],            // Prevent XSS
          "frame-ancestors": ["'none'"],       // Prevent CLICKJACKING
          "base-uri": ["'self'"],              // Prevent XSS
          "upgrade-insecure-requests": [],     // Prevent MITM (forces HTTPS)
        },
      },
      frameguard: { action: "deny" },          // Prevent CLICKJACKING
      referrerPolicy: { policy: "no-referrer" }, // Hide referrer info (privacy)
      hsts: {                                  // Prevent MITM via HTTPS only
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      crossOriginOpenerPolicy: { policy: "same-origin" },   // Prevent XS leaks
      crossOriginResourcePolicy: { policy: "same-origin" }, // Isolate resources
      crossOriginEmbedderPolicy: true,
    })
  );

  // --- Prevent HTTP Parameter Pollution ---
  app.use(hpp()); // Helps prevent SQL injection

  // --- Rate limiter ---
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    })
  ); // Prevent DDoS / brute force attacks

  // --- Sanitize input to block XSS (cross-site scripting) ---
  function deepSanitize(obj) {
    if (!obj || typeof obj !== "object") return obj;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === "string") {
        obj[k] = xss(v); // Prevent XSS → helps prevent session hijacking
      } else if (Array.isArray(v)) {
        obj[k] = v.map((item) =>
          typeof item === "string"
            ? xss(item)
            : (item && typeof item === "object" ? deepSanitize(item) : item)
        );
      } else if (v && typeof v === "object") {
        deepSanitize(v);
      }
    }
    return obj;
  }

  app.use((req, _res, next) => {
    if (req.body && typeof req.body === "object") deepSanitize(req.body);
    if (req.query && typeof req.query === "object") deepSanitize(req.query);
    if (req.params && typeof req.params === "object") deepSanitize(req.params);
    next();
  });

  // --- Timeout slow requests ---
  app.use((req, res, next) => {
    req.setTimeout?.(10_000);
    res.setTimeout?.(10_000);
    next();
  }); // Helps reduce DDoS
}
