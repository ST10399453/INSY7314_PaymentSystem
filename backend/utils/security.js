import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss";

export function applySecurity(app) {
  // --- Helmet: adds various HTTP headers for security ---
  //(NextJS. 2025)
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

/*
REFERENCES

Axios. 2023. “Getting Started | Axios Docs”. 
<https://axios-http.com/docs/intro> [accessed 29 September 2025].

Balaji, Dev. 2023. “JWT Authentication in Node.js: A Practical Guide”. 
September 7, 2023 <https://dvmhn07.medium.com/jwt-authentication-in-node-js-a-practical-guide-c8ab1b432a49> 
[accessed 9 October 2025].

BetterStack. 2022. “A Complete Guide to Timeouts in Node.js | Better Stack Community”.
<https://betterstack.com/community/guides/scaling-nodejs/nodejs-timeouts/> [accessed 1 October 2025].

Codino. 2022. “Secure Your Node.js App with HPP.js: A Step-By-Step Guide”. 
December 31, 2022 <https://codino.medium.com/secure-your-node-js-app-with-hpp-js-a-step-by-step-guide-6926a9464f62> 
[accessed 4 October 2025].

Das, Arunangshu. 2025. “7 Best Practices for Sanitizing Input in Node.js”.
May 26, 2025 <https://medium.com/devmap/7-best-practices-for-sanitizing-input-in-node-js-e61638440096> 
[accessed 6 October 2025].

express-validator. 2019. “Getting Started · Express-Validator”.
<https://express-validator.github.io/docs/> [accessed 9 October 2025].

GeeksforGeeks. 2022a. “Use of CORS in Node.js”.
<https://www.geeksforgeeks.org/node-js/use-of-cors-in-node-js/> [accessed 9 October 2025].

GeeksforGeeks. 2022b. “What Is Expressratelimit in Node.js ?”
<https://www.geeksforgeeks.org/node-js/what-is-express-rate-limit-in-node-js/> [accessed 3 October 2025].

GeeksforGeeks. 2024. “NPM Dotenv”.
<https://www.geeksforgeeks.org/node-js/npm-dotenv/>
[accessed 9 October 2025].

Manico, Jim and August Detlefsen. 2015. Iron-Clad Java: Building Secure Web Applications. 
New York: McGraw-Hill Education.

MDN. 2024. “Express Tutorial Part 3: Using a Database (with Mongoose) - Learn Web Development | MDN”. 
<https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/mongoose> 
[accessed 6 September 2025].

NextJS. 2025. “Documentation | NestJS - a Progressive Node.js Framework”. 
<https://docs.nestjs.com/security/helmet>
[accessed 1 October 2025].

Node.js. 2025. “HTTPS | Node.js V20.0.0 Documentation”.
<https://nodejs.org/api/https.html> [accessed 9 October 2025].

Patel, Ravi. 2024. “A Beginner’s Guide to the Node.js”.
<https://medium.com/@ravipatel.it/a-beginners-guide-to-the-node-js-469f7458bbb2> [accessed 9 October 2025].

React Native. 2025. “React Fundamentals · React Native”.
<https://reactnative.dev/docs/intro-react> [accessed 7 September 2025].

Samson Omojola. 2024. “Password Hashing in Node.js with Bcrypt”.  
January 30, 2024 <https://www.honeybadger.io/blog/node-password-hashing/> [accessed 30 September 2025].

Valsorda, Filippo. 2022. “Mkcert”.
<https://github.com/FiloSottile/mkcert> [accessed 8 October 2025].
*/
