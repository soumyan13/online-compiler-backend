const fs = require("fs");
const path = require("path");
const pty = require("node-pty");

const extractClassName = (code) => {
  const match = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  return match ? match[1] : "Main";
};

const runJava = (code, ws) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const className = extractClassName(code);
  const filename = `${className}.java`;
  const filepath = path.join(tempDir, filename);

  fs.writeFileSync(filepath, code, "utf8");

  const dockerCmd = [
    "run",
    "--rm",
    "-i",
    "-v",
    `${tempDir}:/app`,
    "openjdk:latest",
    "bash",
    "-c",
    ` cd /app && javac ${filename} && java ${className}`,
  ];

  // const shell = process.platform === "win32" ? "cmd.exe" : "bash";

  const ptyProcess = pty.spawn("docker", dockerCmd, {
    name: "xterm-color",
    cwd: process.cwd(),
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;

  ptyProcess.onData((data) => {
    ws.send(data); // stream output to frontend
  });

  ptyProcess.onExit(() => {
    try {
      fs.unlinkSync(filepath);
      const classFile = path.join(tempDir, `${className}.class`);
      if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
    } catch (_) {}
    ws.ptyProcess = null;
  });
};

module.exports = runJava;
