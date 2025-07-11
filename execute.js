const runJS = require("./languages/javascript/execute");
const runC = require("./languages/c/execute");
const runJava = require("./languages/java/execute");

const runCode = (code, language, callback) => {
  switch (language) {
    case "javascript":
      return runJS(code, callback);
    case "c":
      return runC(code, callback);
    case "java":
      return runJava(code, callback);
    default:
      return callback("❌ Unsupported language");
  }
};

module.exports = { runCode };
