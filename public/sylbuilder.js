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
    if (date.getMonth() === 0 && date.getDay() === 1 && date.getDate() >= 15 && date.getDate() <= 21) {
      return true;
    }
    else {
      return false;
    }
  }
  
  function isMemorialDay(date) {
    if (date.getMonth() === 4 && date.getDay() === 1 && date.getDate() >= 25 && date.getDate() <= 31) {
      return true;
    }
    else {
      return false;
    }
  }
  
  function isFourthOfJuly(date) {
    if (date.getMonth() === 6 && date.getDate() === 4) {
      return true;
    }
    if (date.getMonth() === 6 && date.getDate() === 5 && date.getDay() === 1) {
      // 4th observed
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
    else if (info.Semester === "Summer 2019") {
      if (info.CourseType === "12 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2019, 4, 6);
      }
      if (info.CourseType === "Term II") {
        return new Date(2019, 5, 17);
      }
      if (info.CourseType === "Evening Term II") {
        return new Date(2019, 6, 1);
      }
    }
    else if (info.Semester === "Fall 2019") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I") {
        return new Date(2019, 7, 26);
      }
      if (info.CourseType === "Term II") {
        return new Date(2019, 9, 21);
      }
    }
    else if (info.Semester === "Spring 2020") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2020, 0, 6);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2020, 2, 2);
      }
    }
    else if (info.Semester === "Summer 2020") {
      if (info.CourseType === "12 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2020, 4, 4);
      }
      if (info.CourseType === "Term II") {
        return new Date(2020, 5, 15);
      }
      if (info.CourseType === "Evening Term II") {
        return new Date(2020, 5, 29);
      }
    }
    else if (info.Semester === "Fall 2020") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2020, 7, 31);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2020, 9, 26);
      }
    }
    else if (info.Semester === "Spring 2021") {
      if (info.CourseType === "15 Week") {
        return new Date(2021, 0, 18);
      }
      if (info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2021, 0, 11);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2021, 2, 8);
      }
    }
    else if (info.Semester === "Summer 2021") {
      if (info.CourseType === "12 Week" || info.CourseType === "15 Week" || info.CourseType === "Term I") {
        return new Date(2021, 4, 3);
      }
      if (info.CourseType === "Evening Term I") {
        return new Date(2021, 4, 10);
      }
      if (info.CourseType === "Term II") {
        return new Date(2021, 5, 14);
      }
      if (info.CourseType === "Evening Term II") {
        return new Date(2021, 6, 5);
      }
    }
    else if (info.Semester === "Fall 2021") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2021, 7, 30);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2021, 9, 25);
      }
    }
    else if (info.Semester === "Spring 2022") {
      if (info.CourseType === "15 Week") {
        return new Date(2022, 0, 10);
      }
      if (info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2022, 0, 10);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2022, 2, 7);
      }
    }
    else if (info.Semester === "Summer 2022") {
      if (info.CourseType === "12 Week" || info.CourseType === "15 Week" || info.CourseType === "Term I") {
        return new Date(2022, 4, 2);
      }
      if (info.CourseType === "Evening Term I") {
        return new Date(2022, 4, 9);
      }
      if (info.CourseType === "Term II") {
        return new Date(2022, 5, 13);
      }
      if (info.CourseType === "Evening Term II") {
        return new Date(2022, 6, 4);
      }
    }
    else if (info.Semester === "Fall 2022") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2022, 7, 29);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2022, 9, 24);
      }
    }
    else if (info.Semester === "Spring 2023") {
      if (info.CourseType === "15 Week") {
        return new Date(2023, 0, 9);
      }
      if (info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2023, 0, 9);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2023, 2, 6);
      }
    }
    else if (info.Semester === "Summer 2023") {
      if (info.CourseType === "12 Week" || info.CourseType === "15 Week" || info.CourseType === "Term I") {
        return new Date(2023, 4, 1);
      }
      if (info.CourseType === "Evening Term I") {
        return new Date(2023, 4, 8);
      }
      if (info.CourseType === "Term II") {
        return new Date(2023, 5, 12);
      }
      if (info.CourseType === "Evening Term II") {
        return new Date(2023, 6, 3);
      }
    }
    else if (info.Semester === "Fall 2023") {
      if (info.CourseType === "15 Week" || info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2023, 7, 28);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2023, 9, 23);
      }
    }
    else if (info.Semester === "Spring 2024") {
      if (info.CourseType === "15 Week") {
        return new Date(2024, 0, 8);
      }
      if (info.CourseType === "Term I" || info.CourseType === "Evening Term I") {
        return new Date(2024, 0, 8);
      }
      if (info.CourseType === "Term II" || info.CourseType === "Evening Term II") {
        return new Date(2024, 2, 4);
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
    // prepare fields
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
    // fill in personal info
    for (var key in alldata.info) {
      var regexp = new RegExp("\{{"+key+"}}", "g");
      template = template.replace(regexp, alldata.info[key]);
    }
    // fill in course info
    if (alldata.syllabus.info) {
      var isSpecialTopics = alldata.syllabus.info.CourseCode && alldata.syllabus.info.CourseCode.endsWith("95");
      for (var key in alldata.syllabus.info) {
        if (isSpecialTopics && (key === "CourseName" || key === "CourseDescription" || key === "CourseObjectives")) {
          if (typeof alldata.syllabus.fields[key] !== "string") {
            alldata.syllabus.fields[key] = alldata.syllabus.info[key];
          }
        }
        else {
          var regexp = new RegExp("\{{"+key+"}}", "g");
          template = template.replace(regexp, alldata.syllabus.info[key]);
        }
      }
    }
    // extend template with schedule at the end
    if (template[template.length-2] !== "\n" && template[template.length-1] !== "\n") {
      template += "\n\n";
    }
    else if (template[template.length-1] !== "\n") {
      template += "\n";
    }
    if (!alldata.syllabus.info.DoNotGenerateSchedule && getFirstWeek(alldata.syllabus.info)) {
      var date = getFirstWeek(alldata.syllabus.info);
      var duration = 15;
      if (alldata.syllabus.info.CourseType === "12 Week") {
        duration = 12;
      }
      else if (alldata.syllabus.info.CourseType === "Term I" || alldata.syllabus.info.CourseType === "Term II") {
        if (alldata.syllabus.info.Semester.startsWith("Summer")) {
          duration = 6;
        }
        else {
          duration = 8;
        }
      }
      else if (alldata.syllabus.info.CourseType === "Evening Term I" || alldata.syllabus.info.CourseType === "Evening Term II") {
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
      // convert weeks to modules
      if (days.length) {
        var cnt = 0;
        var modulecnt = 0;
        while (cnt <= 15) {
          var counted = false;
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
            if (!counted) {
              counted = true;
              cnt++;
            }
            modulecnt++;
            if (alldata.syllabus.fields && alldata.syllabus.fields["Week"+cnt+weekpart+"Title"] && !alldata.syllabus.fields["Module"+modulecnt+"Title"+days.length+"W"]) {
              alldata.syllabus.fields["Module"+modulecnt+"Title"+days.length+"W"] = alldata.syllabus.fields["Week"+cnt+weekpart+"Title"];
            }
            if (alldata.syllabus.fields && alldata.syllabus.fields["Week"+cnt+weekpart+"Description"] && !alldata.syllabus.fields["Module"+modulecnt+"Description"+days.length+"W"]) {
              alldata.syllabus.fields["Module"+modulecnt+"Description"+days.length+"W"] = alldata.syllabus.fields["Week"+cnt+weekpart+"Description"];
            }
          }
        }
      }
      // generate schedule
      var cnt = 0;
      var modulecnt = 0;
      var thanksgiving = false;
      var mlkday = false;
      var springbreak = false;
      var minusduration = 0;
      var plusduration = 0;
      if (true || days.length) {
        var loopcnt = 0;
        while (cnt < duration + plusduration - (duration === 8 && (thanksgiving ? 1 : 0 || springbreak ? 1 : 0 || minusduration ? minusduration : 0))) {
          var counted = false;
          for (var i = 0; i === 0 || i < days.length; i++) {
            var tmpdate = new Date(date.getTime());
            tmpdate.setDate(tmpdate.getDate() + (days.length ? mapping[days[i]] : 0));
            var datestr = (tmpdate.getMonth()+1)+"/"+tmpdate.getDate()+"/"+tmpdate.getFullYear();
            if (days.length && isThanksgivingWeek(date)) {
              // skip the thanksgiving week
              template += "### Thanksgiving Break (" + datestr + ")\n";
              thanksgiving = true;
            }
            else if (days.length && date.getFullYear() !== 2021 && isSpringBreakWeek(tmpdate, getFirstWeek(alldata.syllabus.info), alldata.syllabus.info.CourseType) && duration !== 8) {
              // skip the spring break week
              template += "### Spring Break (" + datestr + ")\n";
              springbreak = true;
            }
            //else if (isMemorialDay(tmpdate)) {
            //  template += "### Memorial Day (" + datestr + ")\n";
            //  if (days.length >= 2) {
            //    cnt++;
            //  }
            //}
            else if (days.length && isMLKDay(tmpdate) && alldata.syllabus.info.CourseType === "15 Week") {
              mlkday = true;
            }
            else {
              if (!counted) {
                counted = true;
                cnt++;
              }
              modulecnt++;
              template += "### Module " + modulecnt + ": \{{Module" + modulecnt + "Title" + (days.length ? days.length + "W" : "") + "}}";
              if (days.length && (cnt < 15 || !mlkday)) {
                template += " (" + datestr + ")";
              }
              template += "\n";
              if (days.length && isLaborDay(tmpdate)) {
                template += "**NOTE: CLASS DOES NOT MEET DUE TO LABOR DAY**\n";
              }
              if (days.length && isMLKDay(tmpdate)) {
                template += "**NOTE: CLASS DOES NOT MEET DUE TO MARTIN LUTHER KING DAY**\n";
              }
              if (days.length && isMemorialDay(tmpdate)) {
                template += "**NOTE: CLASS DOES NOT MEET DUE TO MEMORIAL DAY**\n";
              }
              if (days.length && isFourthOfJuly(tmpdate)) {
                template += "**NOTE: CLASS DOES NOT MEET DUE TO FOURTH OF JULY**\n";
              }
              if (days.length && cnt === 15) {
                template += "**NOTE: FOR DAY CLASSES PLEASE CHECK THE FINAL EXAM SCHEDULE**\n";
                template += "[https://www.pointpark.edu/About/AdminDepts/RegistrarsOffice/StudentResources/FinalExamsSchedule](https://www.pointpark.edu/About/AdminDepts/RegistrarsOffice/StudentResources/FinalExamsSchedule)\n";
              }
              template += "\{{Module" + modulecnt + "Description" + (days.length ? days.length + "W" : "") + "}}\n";
              template += "\n";
            }
          }
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7);
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
        var value = alldata.syllabus.fields[property] ? alldata.syllabus.fields[property].trim() : alldata.syllabus.fields[property];
        var usetextarea = idx === 0 || (idx > 0 && template[idx-1] === "\n")
        data.push({
          property: property,
          value: value,
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
