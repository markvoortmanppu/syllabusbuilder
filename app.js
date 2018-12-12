// Copyright (c) Mark Voortman - mark@voortman.name. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var fs = require("fs");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var formidable = require("formidable");
var PDFMerge = require("pdf-merge");

var sylbuilder = require("./public/sylbuilder");
var md5file = require("md5-file");
var markdownpdf = require("markdown-pdf");
const csv = require("csvtojson");

require("dotenv").config();

var index = require("./routes/index");
var authorize = require("./routes/authorize");
var builder = require("./routes/builder");
var courses = require("./routes/courses");
var schoology = require("./routes/schoology");
var templates = require("./routes/templates");

var authHelper = require("./helpers/auth");

var schlgy = require("./schoology");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/authorize", authorize);
app.use("/builder", builder);
app.use("/courses", courses);
app.use("/schoology", schoology);
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

async function loadTemplates(req, res, cb) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.readFile("data/templates.json", "utf8", function(err, templatesstr) {
      var tmp = err ? {} : JSON.parse(templatesstr);
      if (err && err.code !== "ENOENT") {
        tmp.error = err;
      }
      cb(tmp);
    });
  }
}

app.get("/load_templates", async function(req, res, next) {
  loadTemplates(req, res, function(data) {
    res.send(data);
  });
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

async function loadData(req, res, cb) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  const userName = req.cookies.graph_user_name;
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
      if (!tmp.name) {
        tmp.name = userName;
      }
      cb(tmp);
    });
  }
}

app.get("/load_data", async function(req, res, next) {
  loadData(req, res, function(data) {
    res.send(data);
  });
});

app.get("/load_catalog_data", async function(req, res, next) {
  csv()
    .fromFile("data/catalog.csv")
    .then(function(jsondata) {
      res.send(jsondata);
    });
});

app.get("/load_schoology_data", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.readFile("data/" + userEmail + ":schoology.json", "utf8", function(err, datastr) {
      var tmp = err ? {} : JSON.parse(datastr);
      if (err && err.code !== "ENOENT") {
        tmp.error = err;
      }
      if (!tmp.credentials) {
        tmp.notInitialized = true;
        res.send(tmp);
      }
      else {
        schlgy.init(tmp.credentials.consumerkey, tmp.credentials.consumersecret, function(instance) {
          if (!instance || !instance.getSections) {
            tmp.notInitialized = true;
            res.send(tmp);
          }
          else {
            instance.getSections(function(sections) {
              res.send({
                sections: sections
              });
            });
          }
        });
      }
    });
  }
});

app.post("/set_schoology_credentials", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.writeFile("data/" + userEmail + ":schoology.json", req.body.data+"\n", "utf8", function(err) {
      res.send(JSON.stringify({
        error: err
      }));
    });
  }
});

function concatPDFs(pdf1, pdf2, cb) {
  var outfile = "/tmp/syllabus:" + Math.random().toString(36).substring(2, 15) + ".pdf";
  if (!pdf2) {
    cb(pdf1);
  }
  else {
    PDFMerge([pdf1, pdf2], {
      output: outfile
    }).then(function() {
      cb(outfile);
    });
  }
}

function createAndUploadPdf(credentials, templatedata, syllabidata, sectionid, cb) {
  var syllabus = null;
  for (var i = syllabidata.syllabi.length-1; i >= 0; i--) {
    if (syllabidata.syllabi[i].info.SectionID === sectionid) {
      syllabus = syllabidata.syllabi[i];
    }
  }
  var alldata = {
    email: syllabidata.email,
    info: syllabidata.info,
    syllabi: syllabidata.syllabi,
    syllabus: syllabus
  };

  var result = sylbuilder.prepare(templatedata, alldata);
  if (result === null) {
    cb({
      error: "Error while preparing syllabus."
    });
    return;
  }
  var template = result.template;
  var data = result.data;

  // replace other fields
  for (var i = 0; i < data.length; i++) {
    var entry = data[i];
    var regexp = new RegExp("\{{"+entry.property+"}}", "g");
    template = template.replace(regexp, entry.value?entry.value:"");
  }

  var fname = ("2019_S_" + alldata.syllabus.info.CourseCode + "_" + alldata.syllabus.info.Section + "_" + alldata.info.NameReversed + ".pdf").replace(/,/g, "").replace(/ /g, "_");

  var tmpname = "/tmp/syllabus:" + Math.random().toString(36).substring(2, 15) + ".pdf";
  //fs.writeFile(tmpname, template, function(err) {
  markdownpdf({
    cssPath: __dirname + "/public/bootstrap.min.css",
    paperFormat: "Letter"
  }).from.string(template).to(tmpname, function(err) {
    var pdfFileAppendix = syllabus.info.PdfFileAppendix;
    var otherpdf = !pdfFileAppendix ? "" : "data/" + syllabidata.email + ":" + pdfFileAppendix.id + ":" + pdfFileAppendix.name;
    concatPDFs(tmpname, otherpdf, function(outfile) {
      if (err) {
        cb({
          error: err.toString()
        });
      }
      else {
        fs.stat(outfile, function(err, stats) {
          if (err) {
            cb({
              error: err.toString()
            });
          }
          else {
            md5file(outfile, function(err, hash) {
              if (err) {
                cb({
                  error: err.toString()
                });
              }
              else {
                schlgy.init(credentials.consumerkey, credentials.consumersecret, function(instance) {
                  instance.uploadFile({
                    fpath: outfile,
                    fname: fname,
                    fsize: stats.size,
                    mimetype: "application/pdf",
                    md5: hash
                  }, function(data) {
                    cb(data);
                  });
                });
              }
            });
          }
        });
      }
    });
  });
}

app.get("/upload", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    res.setHeader("Content-Type", "application/json");
    fs.readFile("data/" + userEmail + ":schoology.json", "utf8", function(err, datastr) {
      var tmp = err ? {} : JSON.parse(datastr);
      if (err && err.code !== "ENOENT") {
        tmp.error = err;
      }
      if (!tmp.credentials) {
        tmp.notInitialized = true;
        res.send(tmp);
      }
      else {
        loadTemplates(req, res, function(templatedata) {
          loadData(req, res, function(syllabidata) {
            createAndUploadPdf(tmp.credentials, templatedata, syllabidata, req.query.section_id, function(data) {
              if (data.error) {
                res.send(data);
              }
              else {
                schlgy.init(tmp.credentials.consumerkey, tmp.credentials.consumersecret, function(instance) {
                  instance.addDocumentFile({
                    sectionid: req.query.section_id,
                    title: "Syllabus",
                    fileid: data.fileid
                  }, function() {
                    res.send({});
                  });
                });
              }
            });
          });
        });
      }
    });
  }
});

app.post("/fileupload", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  var userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    const userAdmin = req.cookies.graph_user_admin;
    if (userAdmin && req.query.email) {
      userEmail = req.query.email;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if (err) {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({
          error: err
        }));
      }
      else {
        var id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        fs.rename(files.file.path, "data/" + userEmail + ":" + id + ":" + files.file.name, function(err) {
          res.setHeader("Content-Type", "application/json");
          res.send(JSON.stringify({
            error: err,
            id: id,
            name: files.file.name
          }));
        });
      }
    });
  }
});

app.get("/files/*", async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  var userEmail = req.cookies.graph_user_email;
  if (accessToken && userEmail) {
    const userAdmin = req.cookies.graph_user_admin;
    if (userAdmin && req.query.email) {
      userEmail = req.query.email;
    }
    var parts = req.url.split("?")[0].split("/");
    var id = decodeURIComponent(parts[2]);
    var name = decodeURIComponent(parts[3]);
    res.sendFile(__dirname + "/data/" + userEmail + ":" + id + ":" + name);
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
