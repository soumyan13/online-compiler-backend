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
  const executable = `${id}.out`;

  // Save C++ code to file
  fs.writeFileSync(filepath, code, "utf8");

  // Step 1: Compile
  const compile = pty.spawn("g++", [filename, "-o", executable], {
    name: "xterm-color",
    cwd: tempDir,
    env: process.env,
  });

  ws.ptyProcess = compile;

  compile.onData((data) => ws.send(data));

  compile.onExit(({ exitCode }) => {
    if (exitCode === 0) {
      // Step 2: Run if compilation succeeded
      const run = pty.spawn(`./${executable}`, [], {
        name: "xterm-color",
        cwd: tempDir,
        env: process.env,
      });

      ws.ptyProcess = run;

      run.onData((data) => ws.send(data));

      run.onExit(() => {
        try {
          fs.unlinkSync(filepath);
          const execPath = path.join(tempDir, executable);
          if (fs.existsSync(execPath)) fs.unlinkSync(execPath);
        } catch (_) {}
        ws.ptyProcess = null;
      });
    } else {
      ws.ptyProcess = null;
    }
  });
};

module.exports = runCpp;
