function currentDateStr() {
  var currentDate = new Date();
  return currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate();
}

function openSpreadSheet() {
  var SPREAD_SHEET_URL = 'replace this by your google spreadsheet url';
  var SHEET_NAME = 'replace this by your sheet name';
  
  var spreadSheet = SpreadsheetApp.openByUrl(SPREAD_SHEET_URL);
  return spreadSheet.getSheetByName(SHEET_NAME);
}
var BALANCE_ROW_NUMBER = 2;
var BALANCE_COLUMN_NUMBER = 3;


function writeRecordToSheet(sheet, record) {
  var emptyRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(emptyRow, 2, 1, 3); // get column 2 ~ 4 of empty row; start from column 2; total 1 row, 3 column
  range.setValues(record);
}

function processMsg(userMessage) {
  var replyMessage;
  var sheet = openSpreadSheet()
  
  if (userMessage == 'balance') { // show balance
    replyMessage = 'Balance: ' + sheet.getSheetValues(BALANCE_ROW_NUMBER, BALANCE_COLUMN_NUMBER, 1, 1);
  }
  else if (userMessage.indexOf("-") > -1) { // add a record for outcome
    var dateStr = currentDateStr();
    var data = userMessage.split("-");
    writeRecordToSheet(sheet, [[dateStr, data[0], -data[1]]]);
    replyMessage = 'added a record for ' + data[0] + '($' + data[1] + ')\n' + 'Balance: ' + sheet.getSheetValues(BALANCE_ROW_NUMBER, BALANCE_COLUMN_NUMBER, 1, 1);
  }
  else if (userMessage.indexOf("+") > -1) { // add a record for income
    var dateStr = currentDateStr();
    var data = userMessage.split("+");
    writeRecordToSheet(sheet, [[dateStr, data[0], data[1]]]);
    replyMessage = 'added a record for ' + data[0] + '($' + data[1] + ')\n' + 'Balance: ' + sheet.getSheetValues(BALANCE_ROW_NUMBER, BALANCE_COLUMN_NUMBER, 1, 1);
  }
  else {
    replyMessage = 'I don't understand.';
  }  
  
  return replyMessage;
}

function doPost(e) {
  var CHANNEL_ACCESS_TOKEN = 'replace this by your line channel access token'';
  var REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
  
  // parse line input data
  var msg= JSON.parse(e.postData.contents);
  var userMessage = msg.events[0].message.text;
  var replyToken = msg.events[0].replyToken;
  
  if (typeof replyToken === 'undefined') {
    return;
  }
  
  // process user input
  var replyMessage = processMsg(userMessage);

  // reply user
  UrlFetchApp.fetch(REPLY_URL, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': replyMessage,
      }],
    }),
  });
}


