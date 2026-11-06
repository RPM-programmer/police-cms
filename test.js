const init = require("./index.js");
const express = require("express");
const app = express();

(async () => {
  await init(app);
  app.listen(2000);
})();
