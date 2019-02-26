// Copyright (c) Mark Voortman - mark@voortman.name. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.

var fs = require("fs");
var path = require("path");
var PDFMerge = require("pdf-merge");

var sylbuilder = require("./public/sylbuilder");
var md5file = require("md5-file");
var markdownpdf = require("markdown-pdf");

function createpdfs() {
  fs.readdir("data", function(err, files) {
    if (err) throw err;
    for (var i = 0; i < files.length; i++) {
      (function(i) {
        if (files[i].indexOf("@") >= 0 && files[i].indexOf(":") === -1) {
          loadTemplates(function(templatedata) {
            loadData(files[i].substring(0, files[i].length-5), function(syllabidata) {
              if (syllabidata.syllabi) {
                for (var j = 0; j < syllabidata.syllabi.length; j++) {
                  if (syllabidata.syllabi[j].info && syllabidata.syllabi[j].info.SectionID) {
                    createAndUploadPdf(templatedata, syllabidata, syllabidata.syllabi[j].info.SectionID, function(data) {
                      // ...
                    });
                  }
                }
              }
            });
          });
        }
      })(i);
    }
  });
}

function loadTemplates(cb) {
  fs.readFile("data/templates.json", "utf8", function(err, templatesstr) {
    var tmp = err ? {} : JSON.parse(templatesstr);
    if (err && err.code !== "ENOENT") {
      tmp.error = err;
    }
    cb(tmp);
  });
}

function loadData(userEmail, cb) {
  fs.readFile("data/" + userEmail + ".json", "utf8", function(err, datastr) {
    var tmp = err ? {} : JSON.parse(datastr);
    if (err && err.code !== "ENOENT") {
      tmp.error = err;
    }
    if (!tmp.email) {
      tmp.email = userEmail;
    }
    //if (!tmp.name) {
    //  tmp.name = userName;
    //}
    cb(tmp);
  });
}

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

function createAndUploadPdf(templatedata, syllabidata, sectionid, cb) {
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
    cssPath: __dirname + "/public/bootstrap_pdf.min.css",
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
        fs.rename(outfile, "data/pdfs/" + fname, function (err) {
          if (err) throw err;
          cb({});
        });
      }
    });
  });
}

createpdfs();
