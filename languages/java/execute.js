const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const runJava = (code, callback) => {
  const tempDir = path.join(__dirname, "../../temp");
  const filepath = path.join(tempDir, "Main.java");
  fs.writeFileSync(filepath, code, { encoding: "utf8" });

  const command = `javac -encoding UTF-8 Main.java && java Main`;

  exec(command, { cwd: tempDir }, (err, stdout, stderr) => {
    try {
      fs.unlinkSync(filepath);
      fs.unlinkSync(path.join(tempDir, "Main.class"));
    } catch (_) {}
    if (err) return callback(stderr || err.message);
    return callback(null, stdout);
  });
};

module.exports = runJava;
