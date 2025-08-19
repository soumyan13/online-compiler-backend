const fs = require("fs");
const path = require("path");
const pty = require("node-pty");
const { v4: uuid } = require("uuid");

const runC = (code, ws) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const id = uuid();
  const filename = `${id}.c`;
  const filepath = path.join(tempDir, filename);
  const executable = `${id}`;

  fs.writeFileSync(filepath, code, "utf8");

  // Docker command broken into parts
  const dockerArgs = [
    "run",
    "--rm",
    "-it", // <-- Required for interactive mode
    "-v",
    `${tempDir}:/app`,
    "gcc:latest",
    "bash",
    "-c",
    `cd /app && gcc ${filename} -o ${executable} && ./${executable}`,
  ];

  const ptyProcess = pty.spawn("docker", dockerArgs, {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;
  // Send container output to frontend
  ptyProcess.onData((data) => {
    ws.send(data);
  });

  // Handle input from frontend
  ws.on("input", (msg) => {
    ptyProcess.write(msg);
  });

  // Cleanup on socket close
  ws.on("close", () => {
    try {
      fs.unlinkSync(filepath);
      const execFile = path.join(tempDir, executable);
      if (fs.existsSync(execFile)) fs.unlinkSync(execFile);
    } catch (_) {}
    ptyProcess.kill();
  });
};

module.exports = runC;
