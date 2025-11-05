# **ACE PAYMENT PORTAL**

## **Prequisites**
Make sure you have the following installed:
- Node.js
- Git
- Visual Studio Code
- **mkcert** (for generating local SSL/TLS certificates)

## **1. Clone to Visual Studio Code**
1. **Open Visual Studio Code**
   Launch VS Code on your computer.

2. **Open Command Pallete**
   `Ctrl + SHIFT + P` 

3. **Search and select**
   Type `Git: Clone` and select Git: Clone from the dropdown.

4. **Enter your GitHub repository link**
   Paste your project’s GitHub URL, for example:
```
   https://github.com/VCSTDN2024/insy7314-part2-ace_pay-group3.git

```

5. **Choose a local folder**
   Select the folder where you want the project to be saved.

6. **Open the project**
   When prompted, click Open to load the cloned repository in VS Code.

## 2. Run the Backend

The backend is configured to run over **HTTPS** (SSL?TLS) locally. Before running, ensure you have the necessary certificate files ('cert.pem' and 'key.pem') in the appropriate directory or use **mkcert** to generate them locally.

In VS Code, open a new terminal (`Ctrl +` or from the top menu: `Terminal → New Terminal`).

1. Navigate to the backend folder:
    ```
    cd ./backend/
    ```
2. Install dependencies:
    ```
    npm install
    ```

3. Start the backend server:
    ```
    npm run dev
    ```
## 3. Run the Frontend

Open another terminal in VS Code( `+` in the terminal window)

1. Navigate to the frontend folder:
    ```
    cd ./frontend/
    ```
2. Install dependencies:
    ```
    npm install
    ```

3. Start the frontend:
    ```
    npm start
    ```
# **Security Implementation**

This application was developed with a DevSecOps approach, incorporating multiple layers of security to protect sensitive customer data and harden the portal against common web attacks.

### **1. Secure Data Handling & Password Security**
* **Password Hashing & Salting:** User passwords are secured using the **bcrypt** library, implementing hashing with a calculated salt.
  ```
  bcrypt.hash(password, saltRounds)
  ```
* **Data Encryption at Rest:** Highly sensitive data (customer 'idNumber', 'accountNumber', payment 'recipient' account, and 'swiftCode') are encrypted using **AES-256-GCM** via a custom 'encrypt' utility before storage.
  ```
  Example: encrypt(idNumber), encrypt(accountNumber)
  ```

### **2. Security in Transit and Input Validation**

* **SSL/TLS Enforcement:** All network traffic is served over **HTTPS** (SSL/TLS) to ensure data is secure in transit and to defend against **Man-in-the-Middle (MiTM) attacks**. The HSTS header is also enforced via Helmet.
* **Input Whitelisting (RegEx):** All critical user inputs are strictly validated against **RegEx patterns** (whitelisting) to prevent malicious data and mitigate **SQL Injection** and **Cross-Site Scripting attacks**.

| Field | RegEx Pattern | Description |
| :--- | :--- | :--- |
| **Full Name** | `/^[A-Za-z\s'-]{2,50}$/` | Letters, spaces, hyphens & apostrophe's only |
| **ID Number** | `/^\d{13}$/` | Exactly 13 digits |
| **Account Number** | `/^\d{6,12}$/` | 6 to 12 digits |
| **Password** | `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/` | Minimum 8 chars, mixed case, number, symbol |

### **3. Portal Hardening and Attack Protection**

The backend is hardened using security middleware, primarily **Helmet**, **express-rate-limit**, **hpp**, and **xss**, to protect against the specific attacks required in the POE.

| Attack | Mitigation Tool/Strategy | Implementation Detail |
| :--- | :--- | :--- |
| **Clickjacking** | **Helmet ('frameguard', 'ContentSecurityPolicy')** | Uses 'frameguard: { action: "deny" }' and 'frame-ancestors: ['none']' to prevent site embedding. |
| **DDoS Attacks** | **Express Rate Limit** & **Timeout** | Limits requests per IP ('max: 200' per minute) and sets timeouts for slow requests. |
| **SQL Injection** | **HPP** & **RegEx Whitelisting** | **hpp** prevents parameter pollution , and **RegEx** limits characters accepted for input. |
| **Cross-Site Scripting (XSS)** | **Helmet ('ContentSecurityPolicy')** & **XSS (Sanitizer)** | Helmet blocks inline scripts, and the **xss** library recursively sanitizes all request data. |
| **Man-in-the-Middle (MiTM)** | **Helmet ('hsts', 'upgrade-insecure-requests')** | HSTS is enabled to force HTTPS, and insecure requests are upgraded to HTTPS. |
| **Session Jacking** | **XSS (Sanitizer)** & **JWT** | Input sanitization prevents token theft vis XSS, and **JSON Web Tokens (JWT)** provide secure, stateless sessions. |

### **4. DevSecOps Pipeline**

The project includes a **CircleCI pipeline** integrated with **SonarQube** for continuous code analysis.

* **Continuous Integration (CI):** The CircleCI pipeline is configured to be triggered whenever code is pushed to the GitHub repository.
* **Static Application Security Testing (SAST):** The pipeline runs a **SonarQube scan** to check for **hotspots** and **code smells** (vulnerabilities and quality issues) before deployment.

# **YouTube**

### Payment System Walkthrough:

[![Watch the video](https://img.youtube.com/vi/JwBKCLEyVzg/maxresdefault.jpg)](https://youtu.be/JwBKCLEyVzg)

# **References**

- Axios. 2023. “Getting Started | Axios Docs”. 
<https://axios-http.com/docs/intro> [accessed 29 September 2025].

- Balaji, Dev. 2023. “JWT Authentication in Node.js: A Practical Guide”. 
September 7, 2023 <https://dvmhn07.medium.com/jwt-authentication-in-node-js-a-practical-guide-c8ab1b432a49> 
[accessed 9 October 2025].

- BetterStack. 2022. “A Complete Guide to Timeouts in Node.js | Better Stack Community”.
<https://betterstack.com/community/guides/scaling-nodejs/nodejs-timeouts/> [accessed 1 October 2025].

- Codino. 2022. “Secure Your Node.js App with HPP.js: A Step-By-Step Guide”. 
December 31, 2022 <https://codino.medium.com/secure-your-node-js-app-with-hpp-js-a-step-by-step-guide-6926a9464f62> 
[accessed 4 October 2025].

- Das, Arunangshu. 2025. “7 Best Practices for Sanitizing Input in Node.js”.
May 26, 2025 <https://medium.com/devmap/7-best-practices-for-sanitizing-input-in-node-js-e61638440096> 
[accessed 6 October 2025].

- express-validator. 2019. “Getting Started · Express-Validator”.
<https://express-validator.github.io/docs/> [accessed 9 October 2025].

- GeeksforGeeks. 2022a. “Use of CORS in Node.js”.
<https://www.geeksforgeeks.org/node-js/use-of-cors-in-node-js/> [accessed 9 October 2025].

- GeeksforGeeks. 2022b. “What Is Expressratelimit in Node.js ?”
<https://www.geeksforgeeks.org/node-js/what-is-express-rate-limit-in-node-js/> [accessed 3 October 2025].

- GeeksforGeeks. 2024. “NPM Dotenv”.
<https://www.geeksforgeeks.org/node-js/npm-dotenv/>
[accessed 9 October 2025].

- Manico, Jim and August Detlefsen. 2015. Iron-Clad Java: Building Secure Web Applications. 
New York: McGraw-Hill Education.

- MDN. 2024. “Express Tutorial Part 3: Using a Database (with Mongoose) - Learn Web Development | MDN”. 
<https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/mongoose> 
[accessed 6 September 2025].

- NextJS. 2025. “Documentation | NestJS - a Progressive Node.js Framework”. 
<https://docs.nestjs.com/security/helmet>
[accessed 1 October 2025].

- Node.js. 2025. “HTTPS | Node.js V20.0.0 Documentation”.
<https://nodejs.org/api/https.html> [accessed 9 October 2025].

- Patel, Ravi. 2024. “A Beginner’s Guide to the Node.js”.
<https://medium.com/@ravipatel.it/a-beginners-guide-to-the-node-js-469f7458bbb2> [accessed 9 October 2025].

- React Native. 2025. “React Fundamentals · React Native”.
<https://reactnative.dev/docs/intro-react> [accessed 7 September 2025].

- Samson Omojola. 2024. “Password Hashing in Node.js with Bcrypt”.  
January 30, 2024 <https://www.honeybadger.io/blog/node-password-hashing/> [accessed 30 September 2025].

- Valsorda, Filippo. 2022. “Mkcert”.
<https://github.com/FiloSottile/mkcert> [accessed 8 October 2025].


---
# **Group Members**
| Name | Student Number |
|------|----------------|
| Akhilesh Parshotam | ST10281011 |
| Alicia Orren | ST10265835 |
| Erin Chisholm | ST10279615 |
| Connor Tre Van Buuren | ST10275455 |
| Ethan Ruey Huntley | ST10399453 |

---
