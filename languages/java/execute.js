const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const runJava = (code, callback) => {
  const filepath = path.join(__dirname, "../../temp", "Main.java");
  fs.writeFileSync(filepath, code);

  const command = `javac Main.java && java Main`;

  exec(command, { cwd: path.dirname(filepath) }, (err, stdout, stderr) => {
    try {
      fs.unlinkSync(filepath);
      fs.unlinkSync(path.join(path.dirname(filepath), "Main.class"));
    } catch (_) {}
    if (err) return callback(stderr || err.message);
    return callback(null, stdout);
  });
};

module.exports = runJava;
