const fs = require("fs");
const path = require("path");
const pty = require("node-pty");
const { v4: uuid } = require("uuid");

const runCpp = (code, ws) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const id = uuid();
  const filename = `${id}.cpp`;
  const filepath = path.join(tempDir, filename);
  const executable = `${id}`;

  // Save C++ code to file
  fs.writeFileSync(filepath, code, "utf8");

  // Docker command for compiling and running C++ interactively
  const dockerCmd = [
    "run",
    "--rm",
    "-i", // Interactive mode for user input
    "-v",
    `${tempDir}:/app`,
    "gcc:latest",
    "bash",
    "-c",
    `cd /app && g++ ${filename} -o ${executable} && ./${executable}`,
  ];

  const ptyProcess = pty.spawn("docker", dockerCmd, {
    name: "xterm-color",
    cwd: process.cwd(),
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;

  // Send program output to frontend
  ptyProcess.onData((data) => {
    ws.send(data);
  });

  // Cleanup when process exits
  ptyProcess.onExit(() => {
    try {
      fs.unlinkSync(filepath);
      const execPath = path.join(tempDir, executable);
      if (fs.existsSync(execPath)) fs.unlinkSync(execPath);
    } catch (_) {}
    ws.ptyProcess = null;
  });
};

module.exports = runCpp;
