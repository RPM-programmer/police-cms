const express = require("express");
const path = require("path");
const log = require("custom-color-logs").print;
const chalk = require("chalk-palette");
const animation = chalk.animation;
const server2 = require(path.join(__dirname, "server", "server.js"));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const server = require("./server/server.js");
async function init(app) {
  console.log(log.ServerGovInfo("Инициальзация системы..."));
  await delay(500);
  await animation.starfield(5000);

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

  rout.use("/sti", trafficPolice); // State Traffic Inspectorate
  rout.use("/ssc", sequrity); // State Security Commission
  rout.use("/nim", inspect); // National Inspection Ministry
  rout.use("/nmg", court); // National Ministry of Justice
  rout.use("/nbs", border); // National Border Service
  rout.use("/npd", user); // National Passport Database

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
