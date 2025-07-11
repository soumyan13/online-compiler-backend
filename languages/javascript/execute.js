const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { exec } = require("child_process");

const runJS = (code, callback) => {
  const id = uuid();
  const filename = `${id}.js`;
  const filepath = path.join(__dirname, "../../temp", filename);
  fs.writeFileSync(filepath, code);

  const command = `node ${filename}`;

  exec(command, { cwd: path.dirname(filepath) }, (err, stdout, stderr) => {
    fs.unlinkSync(filepath);
    if (err) return callback(stderr || err.message);
    return callback(null, stdout);
  });
};

module.exports = runJS;
