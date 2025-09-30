import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import groupRouter from "./routes/group.routes.js";
import { app, server } from "./socket/socket.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

// Fallback env loader in case dotenv fails in certain shells
try {
  if (!process.env.MONGODB_URL) {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
    const fs = await import('fs');
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      raw.split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m) {
          const key = m[1];
          let value = m[2];
          // strip optional surrounding quotes
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = value;
        }
      });
    }
  }
} catch (e) {
  // ignore fallback errors
}

const port = process.env.PORT || 5000;

// ✅ Allow both local dev frontend and deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://chatly-team-chat-system-frontend.onrender.com", // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Serve static uploads (e.g. images, videos)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")));

// ✅ API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);
app.use("/api/group", groupRouter);

// ✅ Start server
server.listen(port, () => {
  connectDb();
  console.log(`✅ Server started on port ${port}`);
});
