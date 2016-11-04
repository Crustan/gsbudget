// Google Sheets Variables
var orderOfGoogleSheet = '1';
var googleSheetId = '1_XEo5aynFAfSeXxXbs_6XbLa2XJ8hb3uXhNdXbkpbzI';
var googleSheetsApiLink = 'https://spreadsheets.google.com/feeds/list/'+ googleSheetId +'/'+ orderOfGoogleSheet +'/public/basic?alt=json';

// App Specific Variables

var day = function(){
  var date = new Date();
  return date.getDate();
};

var yesterday = function(){
  var date = new Date();
  date.setDate(date.getDate() - 1);
  return date.getDate();
};
var yesterdayRow = {};
var prevMonthRow = {};
var thisWeek = function(){
  var date = new Date();
  date.setDate(date.getDate() - 1);
  return date.getWeekNumber();
};
var months = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];

// Functions
Date.prototype.getWeekNumber = function(){
  var d = new Date(+this);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};
function stripPriceUnit(string){
  if (string === undefined){
    return 0;
  } else {
    var newString = string.substr(0, string.length - 3);
    return newString;
  }
}
function getRows(data){
  var rows = [];
  var cells = data.feed.entry;

  for (var i = 0; i < cells.length; i++){
    var rowObj = {};
    if (cells[i].title.$t.indexOf('V') !== -1){
      rowObj.week = cells[i].title.$t;
    } else if ($.inArray(cells[i].title.$t, months) !== -1){
      rowObj.month = cells[i].title.$t;
    } else {
      rowObj.day = cells[i].title.$t;
    }
    var rowCols = cells[i].content.$t.split(',');
    for (var j = 0; j < rowCols.length; j++){
      var keyVal = rowCols[j].split(':');
        rowObj[keyVal[0].trim()] = keyVal[1].trim();
    }
    rows.push(rowObj);
  }
  return rows;
}

function printThisMonth(){
  $.ajax(googleSheetsApiLink).then(function(data){
    var rows = getRows(data);

    var dayRow = $.map(rows, function(row){
      if (Number(row.day) === day()){ return row; }
    })[0];
    if(day() !== 1){
      yesterdayRow = $.map(rows, function(row){
        if (Number(row.day) === yesterday()){ return row; }
      })[0];
    }
    var weekRow = $.map(rows, function(row){
      if (row.week && row.week.indexOf(thisWeek()) !== -1){ return row; }
    })[0];
    var monthRow = $.map(rows, function(row){
      if (row.month){ return row; }
    })[0];

    var areaUnits = $('.area-unit');
    for (var i = 0; i < areaUnits.length; i++){
      var area;
      if ($(areaUnits[i]).hasClass('bromma')){
        area = 'bromma';
      } else if ($(areaUnits[i]).hasClass('taby')){
        area = 'täby';
      } else if ($(areaUnits[i]).hasClass('hagersten')){
        area = 'hägersten';
      } else if ($(areaUnits[i]).hasClass('leveransbil')){
        area = 'leveransbil';
      }
      // Set dynamic HTML content
      // Total
      $('.total').find('label').text('Totalförsäljning ' + monthRow.month);
      $('.total').find('span.price').text(stripPriceUnit(monthRow.totalförsäljning));
      $('.total').find('.current span').text(monthRow.totaltutfall);
      $('.total').find('.goal span.price').text(stripPriceUnit(monthRow.totalbudget));
      $('.total').find('.progress-indicator .fill-container').css('width',monthRow.totaltutfall);

      // Month
      $(areaUnits[i]).find('.month label').text('Försäljning ' + monthRow.month);
      $(areaUnits[i]).find('.new-customers span').text(monthRow[area + 'nyakunder']);
      $(areaUnits[i]).find('.new-numbers span').text(monthRow[area + 'nummer']);
      $(areaUnits[i]).find('.avarage-purchase span.price').text(stripPriceUnit(monthRow[area + 'snittköp']));
  // //$(areaUnits[i]).find('.transactions span').text(monthRow[area + 'transaktioner']);

      $(areaUnits[i]).find('.month span.price').text(stripPriceUnit(monthRow[area + 'försäljning']));
      $(areaUnits[i]).find('.month .current span').text(monthRow[area + 'utfall']);
      $(areaUnits[i]).find('.month .goal span.price').text(stripPriceUnit(monthRow[area + 'budget']));
      $(areaUnits[i]).find('.month .progress-indicator .fill-container').css('width',monthRow[area + 'utfall']);

      // Week
      $(areaUnits[i]).find('.week label').eq(0).text('Försäljning vecka ' + thisWeek());
      $(areaUnits[i]).find('.week article span.price').text(stripPriceUnit(weekRow[area + 'försäljning']));
      $(areaUnits[i]).find('.week .till-1 span').text(weekRow[area + 'säljomg']);
      $(areaUnits[i]).find('.week .till-2 span').text(weekRow[area + 'bokningar']);
      $(areaUnits[i]).find('.week .current span').text(weekRow[area + 'utfall']);
      $(areaUnits[i]).find('.week .goal span.price').text(stripPriceUnit(weekRow[area + 'budget']));
      $(areaUnits[i]).find('.week .progress-indicator .fill-container').css('width',weekRow[area + 'utfall']);
      // $(areaUnits[i]).find('.week .till-3 span.price').text(stripPriceUnit(weekRow[area + 'kassa1']));
      // $(areaUnits[i]).find('.week .till-4 span.price').text(stripPriceUnit(weekRow[area + 'kassa2']));

      // Yesterday
      if(day() === 1){
        $(areaUnits[i]).find('.yesterday label').eq(0).text('Försäljning ' + yesterdayRow.day + ' ' + prevMonthRow.month);
      } else {
        $(areaUnits[i]).find('.yesterday label').eq(0).text('Försäljning ' + yesterdayRow.day + ' ' + monthRow.month);
      }

      $(areaUnits[i]).find('.yesterday article span.price').text(stripPriceUnit(yesterdayRow[area + 'försäljning']));
      $(areaUnits[i]).find('.yesterday .till-1 span').text(yesterdayRow[area + 'säljomg']);
      $(areaUnits[i]).find('.yesterday .till-2 span').text(yesterdayRow[area + 'bokningar']);
      $(areaUnits[i]).find('.yesterday .till-3 span.price').text(stripPriceUnit(yesterdayRow[area + 'kassa1']));
      $(areaUnits[i]).find('.yesterday .till-4 span.price').text(stripPriceUnit(yesterdayRow[area + 'kassa2']));

      // Today
      $(areaUnits[i]).find('.day label').eq(0).text('Budget ' + dayRow.day + ' ' + monthRow.month);
      $(areaUnits[i]).find('.day article span.price').text(stripPriceUnit(dayRow[area + 'budget']));
    }
  });
}

$(document).ready(function(){
  if(day() === 1){
    var googleSheetsApiLinkPrevMonth = 'https://spreadsheets.google.com/feeds/list/'+ googleSheetId +'/2/public/basic?alt=json';
    $.ajax(googleSheetsApiLinkPrevMonth).then(function(data){
      var rows = getRows(data);
      yesterdayRow = $.map(rows, function(row){
        if (Number(row.day) === yesterday()){ return row; }
      })[0];
      prevMonthRow = $.map(rows, function(row){
        if (row.month){ return row; }
      })[0];
    }).then(printThisMonth);
  } else {
    printThisMonth();
  }
});
