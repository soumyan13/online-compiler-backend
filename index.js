const express = require("express");
const http = require("http");
const cors = require("cors");
const WebSocket = require("ws");
const runCode = require("./execute");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Basic health route (optional)
app.get("/", (req, res) => {
  res.send("✅ Compiler backend is live.");
});

// WebSocket connection
wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");

  ws.on("message", (message) => {
    try {
      // First message: JSON with code + language
      const { language, code } = JSON.parse(message);
      runCode(language, code, ws);
    } catch (e) {
      // Later messages are user keystrokes (not JSON)
      if (ws.ptyProcess) {
        ws.ptyProcess.write(message);
      } else {
        // ws.send("❌ No process running.");
        return;
      }
    }
  });

  ws.on("close", () => {
    if (ws.ptyProcess) {
      ws.ptyProcess.kill();
      ws.ptyProcess = null;
    }
    console.log("🔌 WebSocket client disconnected");
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () =>
  console.log(`🚀 Backend (HTTP + WS) running on http://localhost:${PORT}`)
);
