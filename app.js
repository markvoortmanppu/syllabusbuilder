// Copyright (c) Mark Voortman - mark@voortman.name. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var fs = require("fs");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

require("dotenv").config();

var index = require("./routes/index");
var authorize = require("./routes/authorize");
var builder = require("./routes/builder");
var templates = require("./routes/templates");

var authHelper = require("./helpers/auth");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/authorize", authorize);
app.use("/builder", builder);
app.use("/templates", templates);

app.post("/save_templates", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userAdmin = req.cookies.graph_user_admin;
  if (accessToken && userAdmin) {
    res.setHeader("Content-Type", "application/json");
    fs.writeFile("data/templates.json", req.body.data+"\n", "utf8", function(err) {
      res.send(JSON.stringify({
        error: err
      }));
    });
  }
});

app.get("/load_templates", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.readFile("data/templates.json", "utf8", function(err, templatesstr) {
      var tmp = err ? {} : JSON.parse(templatesstr);
      if (err && err.code !== "ENOENT") {
        tmp.error = err;
      }
      res.send(tmp);
    });
  }
});

app.post("/save_data", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.writeFile("data/" + userEmail + ".json", req.body.data+"\n", "utf8", function(err) {
      res.send(JSON.stringify({
        error: err
      }));
    });
  }
});

app.get("/load_data", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.readFile("data/" + userEmail + ".json", "utf8", function(err, datastr) {
      var tmp = err ? {} : JSON.parse(datastr);
      if (err && err.code !== "ENOENT") {
        tmp.error = err;
      }
      if (!tmp.email) {
        tmp.email = userEmail;
      }
      res.send(tmp);
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
