const fs = require("fs");
const path = require("path");
const pty = require("node-pty");

const runPython = (code, ws) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const filename = "main.py";
  const filepath = path.join(tempDir, filename);

  fs.writeFileSync(filepath, code, "utf8");

  const dockerCmd = [
    "run",
    "--rm",
    "-i",
    "-v",
    `${tempDir}:/app`,
    "python:latest", // official Python image
    "bash",
    "-c",
    `cd /app && python ${filename}`,
  ];

  const ptyProcess = pty.spawn("docker", dockerCmd, {
    name: "xterm-color",
    cwd: process.cwd(),
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;

  ptyProcess.onData((data) => {
    ws.send(data); // stream live output
  });

  ptyProcess.onExit(() => {
    try {
      fs.unlinkSync(filepath);
    } catch (_) {}
    ws.ptyProcess = null;
  });
};

module.exports = runPython;
