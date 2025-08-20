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
  const executable = path.join(tempDir, `${id}.out`);

  fs.writeFileSync(filepath, code, "utf8");

  // 🔥 Directly run gcc instead of docker
  const compileCmd = `gcc ${filepath} -o ${executable} && ${executable}`;

  const ptyProcess = pty.spawn("bash", ["-c", compileCmd], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: tempDir,
    env: process.env,
  });

  ws.ptyProcess = ptyProcess;

  // Output from compiler/program → frontend
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
      if (fs.existsSync(executable)) fs.unlinkSync(executable);
    } catch (_) {}
    ptyProcess.kill();
  });
};

module.exports = runC;
