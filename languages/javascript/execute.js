const fs = require("fs");
const path = require("path");
const pty = require("node-pty");
const { v4: uuid } = require("uuid");

const runJS = (code, ws) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const id = uuid();
  const filename = `${id}.js`;
  const filepath = path.join(tempDir, filename);

  fs.writeFileSync(filepath, code, "utf8");

  // 🔥 Directly run Node.js without Docker
  const runCmd = `node ${filepath}`;

  const ptyProcess = pty.spawn("bash", ["-c", runCmd], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: tempDir,
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;

  // Output from Node.js → frontend
  ptyProcess.onData((data) => {
    ws.send(data);
  });

  // Input from frontend → Node.js process
  ws.on("message", (msg) => {
    ptyProcess.write(msg);
  });

  // Cleanup on socket close
  ws.on("close", () => {
    try {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch (_) {}
    ptyProcess.kill();
  });
};

module.exports = runJS;
