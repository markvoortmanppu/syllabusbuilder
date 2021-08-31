// Copyright (c) Mark Voortman - mark@voortman.name. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.

var fs = require("fs");
var path = require("path");
var PDFMerge = require("pdf-merge");

var sylbuilder = require("./public/sylbuilder");
var md5file = require("md5-file");
const { exec } = require("child_process");

function createpdfs() {
  fs.readdir("data", function(err, files) {
    if (err) throw err;
    function next(i) {
      if (i < files.length) {
        createpdf(files[i], function() {
          next(i+1);
        })
      }
    }
    next(0);
  });
}

function createpdf(fname, cb) {
  var count = 0;
  function checkIfDone() {
    count--;
    if (count <= 0) {
      if (cb) {
        cb();
        cb = null;
      }
    }
  }
  if (fname.indexOf("@") === -1 || fname.indexOf(":") >= 0) {
    if (cb) {
      cb();
      cb = null;
    }
  }
  else {
    loadTemplates(function(templatedata) {
      loadData(fname.substring(0, fname.length-5), function(syllabidata) {
        if (!syllabidata.syllabi) {
          if (cb) {
            cb();
            cb = null;
          }
        }
        else {
          for (var j = 0; j < syllabidata.syllabi.length; j++) {
            if (syllabidata.syllabi[j].info && syllabidata.syllabi[j].info.SectionID) {
              count++;
              createAndUploadPdf(templatedata, syllabidata, syllabidata.syllabi[j].info.SectionID, function(data) {
                checkIfDone();
              });
            }
          }
          if (count === 0) {
            if (cb) {
              cb();
              cb = null;
            }
          }
        }
      });
    });
  }
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
    if (syllabidata.syllabi[i].info && syllabidata.syllabi[i].info.SectionID === sectionid) {
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

  var parts = alldata.syllabus.info.Semester.split(" ");
  var semester = parts[0];
  var year = parts[1];
  if (semester === "Fall") {
    semester = "F";
  }
  else if (semester === "Spring") {
    semester = "S";
  }
  else if (semester === "Summer") {
    semester = "Z";
  }
  var fname = (year + "_" + semester + "_" + alldata.syllabus.info.CourseCode + "_" + alldata.syllabus.info.Section + "_" + alldata.info.NameReversed + ".pdf").replace(/,/g, "").replace(/ /g, "_");

  var tmpname = "/tmp/syllabus:" + Math.random().toString(36).substring(2, 15) + ".pdf";
  fs.writeFile(tmpname.replace(".pdf", ".md"), template.replace("![](https://mvoortman.it.pointpark.edu/logo.png)", "![](https://mvoortman.it.pointpark.edu/logo.png){ width=150px }"), function(err) {
    exec("pandoc -f markdown+hard_line_breaks-raw_tex -V colorlinks=true -V linkcolor=blue -V urlcolor=blue -V toccolor=blue -V geometry:margin=1in --self-contained --pdf-engine=xelatex " + tmpname.replace(".pdf", ".md") + " -o " + tmpname, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        //return;
      }
      //console.log(`stdout: ${stdout}`);
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
  });
}

createpdfs();
