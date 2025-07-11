const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { exec } = require("child_process");

const runC = (code, callback) => {
  const id = uuid();
  const filename = `${id}.c`;
  const filepath = path.join(__dirname, "../../temp", filename);
  const outFile = `${id}`;
  fs.writeFileSync(filepath, code);

  const command = `gcc ${filename} -o ${outFile} && ./${outFile}`;

  exec(command, { cwd: path.dirname(filepath) }, (err, stdout, stderr) => {
    try {
      fs.unlinkSync(filepath);
      fs.unlinkSync(path.join(path.dirname(filepath), outFile));
    } catch (_) {}
    if (err) return callback(stderr || err.message);
    return callback(null, stdout);
  });
};

module.exports = runC;
