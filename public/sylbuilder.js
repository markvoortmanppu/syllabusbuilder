(function(exports){
  
  exports.test = function(){
    return "This is a function from shared module";
  };
  
  function isThanksgivingWeek(date) {
    if (date.getMonth() !== 10) {
      return false;
    }
    var tmpdate = new Date(date.getTime());
    // change to thursday
    tmpdate.setDate(tmpdate.getDate() + 4 - tmpdate.getDay());
    // go back 3 weeks
    tmpdate.setDate(tmpdate.getDate() - 21);
    if (tmpdate.getMonth() === 10 && tmpdate.getDate() >= 1 && tmpdate.getDate() <= 7) {
      return true;
    }
    return false;
  }
  
  function isSpringBreakWeek(date, startdate) {
    if (date.getMonth() >= 5) {
      return false;
    }
    var diff = date.getTime() - startdate.getTime();
    var ndays = Math.ceil(diff / (1000 * 3600 * 24));
    if (ndays >= 7*7 && ndays < 7*8) {
      return true;
    }
    else {
      return false;
    }
  }
  
  function isLaborDay(date) {
    if (date.getMonth() === 8 && date.getDay() === 1 && date.getDate() >= 1 && date.getDate() <= 7) {
      return true;
    }
    else {
      return false;
    }
  }
  
  function isMLKDay(date) {
    if (date.getMonth() === 0 && date.getDay() === 1 && date.getDate() >= 21 && date.getDate() < 28) {
      return true;
    }
    else {
      return false;
    }
  }
  
  function newDate(str) {
    var date = new Date();
    if (str) {
      var parts = str.split("-");
      date = new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
    }
    return date;
  }
  
  exports.prepare = function(data, alldata) {
    var template = null;
    for (var i = 0; i < data.templates.length; i++) {
      if (data.templates[i].id === alldata.syllabus.info.Template) {
        template = data.templates[i].template;
        break;
      }
    }
    if (template === null) {
      return null;
    }
    // fill in personal info
    for (var key in alldata.info) {
      var regexp = new RegExp("\{{"+key+"}}", "g");
      template = template.replace(regexp, alldata.info[key]);
    }
    // fill in course info
    if (alldata.syllabus.info) {
      for (var key in alldata.syllabus.info) {
        var regexp = new RegExp("\{{"+key+"}}", "g");
        template = template.replace(regexp, alldata.syllabus.info[key]);
      }
    }
    // extend template with schedule at the end
    if (alldata.syllabus.info.DateFirstClass) {
      if (template[template.length-2] !== "\n" && template[template.length-1] !== "\n") {
        template += "\n\n";
      }
      else if (template[template.length-1] !== "\n") {
        template += "\n";
      }
      var datefirstclass = alldata.syllabus.info.DateFirstClass;
      var date = newDate(datefirstclass);
      var duration = 15;
      if (alldata.syllabus.info.CourseDuration === "8 Weeks") {
        duration = 8;
      }
      var cnt = 0;
      var thanksgiving = false;
      while (cnt < duration - (duration === 8 && thanksgiving ? 1 : 0)) {
        var datestr = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
        if (isThanksgivingWeek(date)) {
          // skip the thanksgiving week
          template += "### Thanksgiving Break (" + datestr + ")";
          template += "\n";
          thanksgiving = true;
        }
        else if (isSpringBreakWeek(date, newDate(datefirstclass))) {
          // skip the spring break week
          template += "### Spring Break (" + datestr + ")";
          template += "\n";
        }
        else {
          cnt++;
          var regexp = new RegExp("\{{Week"+cnt+"Date}}", "g");
          template = template.replace(regexp, (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear());
          template += "### Week " + cnt + ": \{{Week" + cnt + "Title}} (" + datestr + ")\n";
          if (isLaborDay(date)) {
            template += "**NOTE: CLASS DOES NOT MEET DUE TO LABOR DAY**\n";
          }
          if (isMLKDay(date)) {
            template += "**NOTE: CLASS DOES NOT MEET DUE TO MARTIN LUTHER KING DAY**\n";
          }
          template += "\{{Week" + cnt + "Description}}\n"
          template += "\n";
        }
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7);
      }
    }
    if (!alldata.syllabus.fields) {
      alldata.syllabus.fields = {};
      // fill in information from older course if it matches
      for (var i = alldata.syllabi.length-1; i >= 0; i--) {
        var tmpsyllabus = alldata.syllabi[i];
        if (alldata.syllabus.info.SectionID !== tmpsyllabus.info.SectionID && alldata.syllabus.info.CourseCode === tmpsyllabus.info.CourseCode && alldata.syllabus.info.CourseDuration === tmpsyllabus.info.CourseDuration) {
          for (var key in tmpsyllabus.fields) {
            if (!(key in alldata.syllabus.fields)) {
              alldata.syllabus.fields[key] = tmpsyllabus.fields[key];
            }
          }
          break;
        }
      }
    }
    var data = [];
    var parts = template.split("\{{");
    for (var i = 1; i < parts.length; i++) {
      var property = parts[i].substr(0, parts[i].indexOf("}}"));
      if (property.startsWith("Week") && property.endsWith("Date")) {
        // do not add
      }
      else {
        if (!alldata.syllabus.fields[property]) {
          alldata.syllabus.fields[property] = "";
        }
        var idx = template.indexOf("\{{"+property+"}}");
        var usetextarea = idx === 0 || (idx > 0 && template[idx-1] === "\n")
        data.push({
          property: property,
          value: alldata.syllabus.fields[property],
          usetextarea: usetextarea
        });
      }
    }
    return {
      template: template,
      data: data
    };
  }
  
}(typeof exports === "undefined" ? this.sylbuilder = {} : exports));
