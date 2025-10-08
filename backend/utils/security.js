import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss";

export function applySecurity(app) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'"],
          "frame-ancestors": ["'none'"],
          "base-uri": ["'self'"],
          "upgrade-insecure-requests": [],
        },
      },
      frameguard: { action: "deny" },
      referrerPolicy: { policy: "no-referrer" },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "same-origin" },
      crossOriginEmbedderPolicy: true,
    })
  );

  // Prevent parameter pollution
  app.use(hpp());

  // Rate limiter
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // // ---- XSS scrubbing (mutate in place; do NOT reassign req.body/req.query) ----
  // function deepSanitize(obj) {
  //   if (!obj || typeof obj !== "object") return obj;
  //   for (const k of Object.keys(obj)) {
  //     const v = obj[k];
  //     if (typeof v === "string") {
  //       obj[k] = xss(v);
  //     } else if (Array.isArray(v)) {
  //       obj[k] = v.map((item) =>
  //         typeof item === "string"
  //           ? xss(item)
  //           : (item && typeof item === "object" ? deepSanitize(item) : item)
  //       );
  //     } else if (v && typeof v === "object") {
  //       deepSanitize(v);
  //     }
  //   }
  //   return obj;
  // }

  // app.use((req, _res, next) => {
  //   if (req.body && typeof req.body === "object") deepSanitize(req.body);   // mutate
  //   if (req.query && typeof req.query === "object") deepSanitize(req.query); // mutate
  //   if (req.params && typeof req.params === "object") deepSanitize(req.params);
  //   next();
  // });
  // ---------------------------------------------------------------------------

  // Timeouts
  app.use((req, res, next) => {
    req.setTimeout?.(10_000);
    res.setTimeout?.(10_000);
    next();
  });
}
