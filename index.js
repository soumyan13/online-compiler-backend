const express = require("express");
const cors = require("cors");
const { runCode } = require("./execute");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language)
    return res.status(400).json({ output: "Code or language missing." });

  runCode(code, language, (err, output) => {
    if (err) return res.json({ output: err });
    res.json({ output });
  });
});

app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));
