const express = require("express");
const path = require("path");
const log = require("custom-color-logs").print;
const chalk = require("chalk-palette");
const animation = chalk.animation;
const server = require("./server/server.js");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function init(app) {
  if (log && log.ServerGovInfo) {
    console.log(log.ServerGovInfo("Инициальзация системы..."));
  }
  await delay(500);

  if (animation && animation.starfield) {
    await animation.starfield(5000);
  }

  const trafficPolice = server.trafficPolice;
  const sequrity = server.sequrity;
  const inspect = server.inspect;
  const court = server.court;
  const border = server.border;
  const user = server.user;

  trafficPolice.use("/", express.static(path.join(__dirname, "public", "tp")));
  sequrity.use("/", express.static(path.join(__dirname, "public", "seq")));
  inspect.use("/", express.static(path.join(__dirname, "public", "ins")));
  court.use("/", express.static(path.join(__dirname, "public", "cou")));
  border.use("/", express.static(path.join(__dirname, "public", "bor")));
  user.use("/", express.static(path.join(__dirname, "public", "user")));

  const rout = express.Router();

  rout.use("/sti", trafficPolice);
  rout.use("/ssc", sequrity);
  rout.use("/nim", inspect);
  rout.use("/nmg", court);
  rout.use("/nbs", border);
  rout.use("/npd", user);

  rout.use("/", express.static(path.join(__dirname, "public", "general")));

  rout.get("/home", async (req, res) => {
    res.redirect("/gov/html/home.html");
  });
  rout.get("/general", async (req, res) => {
    res.redirect("/gov/html/home.html");
  });
  rout.get("/", async (req, res) => {
    res.redirect("/gov/html/home.html");
  });

  app.use("/gov", rout);
}

module.exports = init;
