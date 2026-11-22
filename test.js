const express = require("express");
const policeCms = require("./index");

const app = express();

(async () => {
  await policeCms(app);
  app.listen(2000, () => {
    console.log("Сервер police-cms запущен: http://localhost:2000/police-cms");
  });
})();
