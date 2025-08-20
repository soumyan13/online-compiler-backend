const fs = require("fs");
const path = require("path");
const pty = require("node-pty");
const { v4: uuid } = require("uuid");

const runPython = (code, ws) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const id = uuid();
  const filename = `${id}.py`;
  const filepath = path.join(tempDir, filename);

  fs.writeFileSync(filepath, code, "utf8");

  // 🔥 Directly run python instead of docker
  const runCmd = `python3 ${filepath}`;

  const ptyProcess = pty.spawn("bash", ["-c", runCmd], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: tempDir,
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;

  // Output from program → frontend
  ptyProcess.onData((data) => {
    ws.send(data);
  });

  // Input from frontend → program
  ws.on("input", (msg) => {
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

module.exports = runPython;
