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
  
  function isSpringBreakWeek(date, startdate, coursetype) {
    if (date.getMonth() >= 5 || coursetype === "Term II") {
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
  
  function getFirstWeek(info) {
    if (info.Semester === "Spring 2019") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I") {
        return new Date(2019, 0, 7);
      }
      if (info.CourseType === "Term II") {
        return new Date(2019, 2, 4);
      }
    }
    return null;
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
    if (template[template.length-2] !== "\n" && template[template.length-1] !== "\n") {
      template += "\n\n";
    }
    else if (template[template.length-1] !== "\n") {
      template += "\n";
    }
    var date = getFirstWeek(alldata.syllabus.info);
    var duration = 15;
    if (alldata.syllabus.info.CourseType === "Term I" || alldata.syllabus.info.CourseType === "Term II") {
      duration = 8;
    }
    var alldays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var days = [];
    for (var i = 0; i < alldays.length; i++) {
      if (alldata.syllabus.info.ClassMeetingDays && alldata.syllabus.info.ClassMeetingDays.indexOf(alldays[i]) >= 0) {
        days.push(alldays[i]);
      }
    }
    var mapping = {
      "Monday": 0,
      "Tuesday": 1,
      "Wednesday": 2,
      "Thursday": 3,
      "Friday": 4,
      "Saturday": 5,
      "Sunday": 6
    };
    var cnt = 0;
    var thanksgiving = false;
    var springbreak = false;
    while (cnt < duration - (duration === 8 && (thanksgiving ? 1 : 0 || springbreak ? 1 : 0))) {
      for (var i = 0; i < days.length; i++) {
        var weekpart = "";
        if (days.length > 1) {
          if (i === 0) {
            weekpart = "a";
          }
          else if (i === 1) {
            weekpart = "b";
          }
          else if (i === 2) {
            weekpart = "c";
          }
          else if (i === 3) {
            weekpart = "d";
          }
          else if (i === 4) {
            weekpart = "e";
          }
          else if (i === 5) {
            weekpart = "f";
          }
          else if (i === 6) {
            weekpart = "g";
          }
          else if (i === 7) {
            weekpart = "h";
          }
        }
        var tmpdate = new Date(date.getTime());
        tmpdate.setDate(tmpdate.getDate() + mapping[days[i]]);
        var datestr = (tmpdate.getMonth()+1)+"/"+tmpdate.getDate()+"/"+tmpdate.getFullYear();
        if (isThanksgivingWeek(date)) {
          // skip the thanksgiving week
          template += "### Thanksgiving Break (" + datestr + ")";
          template += "\n";
          thanksgiving = true;
        }
        else if (isSpringBreakWeek(tmpdate, getFirstWeek(alldata.syllabus.info), alldata.syllabus.info.CourseType)) {
          // skip the spring break week
          template += "### Spring Break (" + datestr + ")";
          template += "\n";
          springbreak = true;
        }
        else {
          if (i === 0) {
            cnt++;
          }
          var regexp = new RegExp("\{{Week"+cnt+weekpart+"Date}}", "g");
          template = template.replace(regexp, (tmpdate.getMonth()+1)+"/"+tmpdate.getDate()+"/"+tmpdate.getFullYear());
          template += "### Week " + cnt + weekpart + ": \{{Week" + cnt + weekpart + "Title}} (" + datestr + ")\n";
          if (isLaborDay(tmpdate)) {
            template += "**NOTE: CLASS DOES NOT MEET DUE TO LABOR DAY**\n";
          }
          if (isMLKDay(tmpdate)) {
            template += "**NOTE: CLASS DOES NOT MEET DUE TO MARTIN LUTHER KING DAY**\n";
          }
          template += "\{{Week" + cnt + weekpart + "Description}}\n"
          template += "\n";
        }
      }
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7);
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
