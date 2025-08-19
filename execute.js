const runJava = require("./languages/java/execute");
const runC = require("./languages/c/execute");
const runJavaScript = require("./languages/javascript/execute");
const runPython = require("./languages/python/execute");
const runCpp = require("./languages/cpp/execute");

const runCode = (language, code, input, ws) => {
  switch (language.toLowerCase()) {
    case "java":
      runJava(code, input, ws);
      break;
    case "c":
      runC(code, input, ws);
      break;
    case "javascript":
    case "js":
      runJavaScript(code, input, ws);
      break;
    case "c++":
    case "cpp":
      runCpp(code, input, ws);
      break;
    case "python":
    case "py":
      runPython(code, input, ws);
      break;
    default:
      ws.send("❌ Language not supported");
  }
};

module.exports = runCode;
