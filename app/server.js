const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.static(join(__dirname, "public")));

app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "/public/index.html"));
});

process.on("SIGINT", function() {
  process.exit();
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));