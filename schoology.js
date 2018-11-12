var querystring = require("querystring");
var https = require("https");
var fs = require("fs");

function authorize(conn) {
  var timestamp = Math.round(Date.now()/1000);
  var signature = conn.consumerSecret;
  return 'OAuth realm="Schoology API", oauth_consumer_key="' + conn.consumerKey + '", oauth_token="", oauth_nonce="' + timestamp + '", oauth_timestamp="' + timestamp + '", oauth_signature_method="PLAINTEXT", oauth_version="1.0", oauth_signature="' + signature + '%26"';
}

function performRequest(conn, endpoint, method, data, success) {
  setTimeout(function() {
    if (data) {
      var dataString = JSON.stringify(data);
    }
    
    if (!endpoint || !endpoint.startsWith(conn.apiBase)) {
      endpoint = conn.apiBase + endpoint;
    }
    
    var authorization = authorize(conn);
    
    if (method == "GET") {
      endpoint += "?" + querystring.stringify(data);
    }
    
    var headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": authorization
    };
    
    if (data) {
      headers["Content-Length"] = dataString.length;
    }
    
    var options = {
      host: conn.host,
      path: endpoint,
      method: method,
      headers: headers
    };
    
    var req = https.request(options, function(res) {
      res.setEncoding("utf-8");
      
      var responseString = "";
      
      res.on("data", function(data) {
        responseString += data;
      });
      
      res.on("end", function() {
        //console.log(res.statusCode);
        //console.log(JSON.stringify(res.headers));
        //console.log(responseString);
        var responseObject = null;
        if (res.statusCode !== 200 && res.statusCode !== 201) {
          responseObject = {
            error: responseString
          };
        }
        else if (responseString) {
          responseObject = JSON.parse(responseString);
        }
        success(res.headers, responseObject);
      });
    });
    
    if (data) {
      req.write(dataString);
    }
    req.end();
  }, 1000);
}

/*
performRequest("users/me", "GET", {
  // ...
}, function(data) {
  console.log(data);
  // location: users/60806812
});
*/

/*
performRequest("users/60806812", "GET", {
  // ...
}, function(data) {
  console.log(data);
});
*/

/*
performRequest("users/60806812/sections", "GET", {
  // ...
}, function(data) {
  console.log(data);
  //var path = "/home/mvoortman/www/schoology";
  //fs.mkdirSync(path, "0755", true);
  //var section = data.section;
  //for (var i = 0; i < section.length; i++) {
  //  var coursepath = path + "/" + section[i].course_code;
  //  fs.mkdirSync(coursepath, "0755", true);
  //  fs.writeFileSync(coursepath + "/course_title.txt", section[i].course_title);
  //  fs.writeFileSync(coursepath + "/section_title.txt", section[i].section_title);
  //}
});
*/

/*
performRequest("courses/1348048509/sections", "GET", {
  // ...
}, function(data) {
  console.log(data);
});
*/

/*
performRequest("courses/1348048511/folder/0", "GET", {
  // ...
}, function(data) {
  console.log(data);
  console.log(JSON.stringify(data, null, 2));
});
*/

function init(consumerKey, consumerSecret, cb) {
  var conn = {
    host: "api.schoology.com",
    apiBase: "/v1/",
    consumerKey: consumerKey,
    consumerSecret: consumerSecret
  };
  performRequest(conn, "users/me", "GET", {
    // ...
  }, function(headers, data) {
    if (data.error) {
      cb({
        getUserID: function() {
          return null;
        }
      });
      return;
    }
    var location = headers.location;
    var userid = location.substr(location.lastIndexOf("/")+1);
    cb({
      getUserID: function() {
        return userid;
      },
      geturl: function(url, cb) {
        performRequest(conn, url, "GET", {
          // ...
        }, function(headers, data) {
          cb(data);
        });
      },
      getSections: function(cb) {
        performRequest(conn, "users/" + userid + "/sections", "GET", {
          // ...
        }, function(headers, data) {
          cb(data);
        });
      },
      getDocuments: function(sectionid, cb, next) {
        performRequest(conn, "sections/" + sectionid + "/documents" + (!next ? "" : next.substring(next.indexOf("?"))), "GET", {
          // ...
        }, function(headers, data) {
          cb(data);
        });
      },
      addDocumentFile: function(ops, cb, next) {
        performRequest(conn, "sections/" + ops.sectionid + "/documents", "POST", {
          "title": ops.title,
          "file-attachment": {
            "id": [
              ops.fileid
            ]
          }
        }, function(headers, data) {
          cb(data);
        });
      },
      getAssignments: function(sectionid, cb, next) {
        performRequest(conn, "sections/" + sectionid + "/assignments?with_attachments=1" + (!next ? "" : "&"+next.substring(next.indexOf("?")+1)), "GET", {
          // ...
        }, function(headers, data) {
          cb(data);
        });
      },
      downloadDocument: function(filename, download_path, cb) {
        setTimeout(function() {
          var endpoint = download_path.substr("https://api.schoology.com".length);
          var options = {
            host: conn.host,
            path: endpoint,
            headers: {
              //"Accept": "application/json",
              //"Content-Type": "application/json",
              //"Content-Length": dataString.length,
              "Authorization": authorize(conn)
            }
          };
          var req = https.get(options, function(res) {
            var outpath = "/home/mvoortman/www/courses/mba-544/onground/" + filename;
            var location = res.headers.location;
            
            var spawn = require("child_process").spawn;
            var cmd = spawn("fetch", ["-q", "-o", outpath, location]);
            
            cmd.stdout.on("data", function(data) {
              console.log("stdout: " + data);
            });
            
            cmd.stderr.on("data", function(data) {
              console.log("stderr: " + data);
            });
            
            cmd.on("close", function(err) {
              if (err) {
                console.log("Error while downloading " + filename + ": " + err);
              }
              cb();
            });
          });
        }, 1000);
      },
      uploadFile: function(ops, cb) {
        performRequest(conn, "upload", "POST", {
          filename: ops.fname,
          filesize: ops.fsize,
          md5_checksum: ops.md5,
        }, function(headers, data) {
          setTimeout(function() {
            var endpoint = data.upload_location.substr("https://api.schoology.com".length);
            var req = https.request({
              host: conn.host,
              method: "PUT",
              path: endpoint,
              headers: {
                "Accept": "application/json",
                "Content-Length": ops.fsize,
                "Content-Type": ops.mimetype,
                "Authorization": authorize(conn)
              }
            }, function(res) {
              res.setEncoding("utf-8");
              var responseString = "";
              res.on("data", function(data) {
                responseString += data;
              });
              res.on("end", function() {
                var responseObject = {
                  fileid: data.id
                };;
                if (res.statusCode !== 204) {
                  responseObject = {
                    error: responseString
                  };
                }
                cb(responseObject);
              });
            });
            req.on("error", function(e) {
              console.log("Upload failed: " + e);
            });
            fs.createReadStream(ops.fpath).pipe(req);
          }, 1000)
        });
      }
    });
  });
}

module.exports.init = init;
