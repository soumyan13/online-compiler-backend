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

  // Step 1: compile with javac
  const compile = pty.spawn("javac", [filename], {
    name: "xterm-color",
    cwd: tempDir,
    env: process.env,
  });

  ws.ptyProcess = compile;

  compile.onData((data) => {
    ws.send(data);
  });

  compile.onExit(({ exitCode }) => {
    if (exitCode === 0) {
      // Step 2: run with java if compilation succeeds
      const run = pty.spawn("java", [className], {
        name: "xterm-color",
        cwd: tempDir,
        env: process.env,
      });

      ws.ptyProcess = run;

      run.onData((data) => ws.send(data));

      run.onExit(() => {
        try {
          fs.unlinkSync(filepath);
          const classFile = path.join(tempDir, `${className}.class`);
          if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        } catch (_) {}
        ws.ptyProcess = null;
      });
    } else {
      ws.ptyProcess = null;
    }
  });
};

module.exports = runJava;
