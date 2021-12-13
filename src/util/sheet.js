/* global gapi */
const SheetNotFoundError = require('../../src/exceptions/sheetNotFoundError')
const UnauthorizedError = require('../../src/exceptions/unauthorizedError')
const ExceptionMessages = require('./exceptionMessages')

const Sheet = function (sheetReference) {
  var self = {};

  (function () {
    var matches = sheetReference.match('https:\\/\\/docs.google.com\\/spreadsheets\\/d\\/(.*?)($|\\/$|\\/.*|\\?.*)')
    self.id = matches !== null ? matches[1] : sheetReference
  })()

  self.getSheet = function () {
    return gapi.client.sheets.spreadsheets.get({ spreadsheetId: self.id })
  }

  self.getData = function (range) {
    return gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: self.id,
      range: range
    })
  }

  self.processSheetResponse = function (sheetName, createBlips, handleError) {
    self.getSheet().then(response => processSheetData(sheetName, response, createBlips, handleError)).catch(handleError)
  }

  function processSheetData (sheetName, sheetResponse, createBlips, handleError) {
    const sheetNames = sheetResponse.result.sheets.map(s => s.properties.title)
    sheetName = !sheetName ? sheetNames[0] : sheetName
    self.getData(sheetName + '!A1:E')
      .then(r => createBlips(sheetResponse.result.properties.title, r.result.values, sheetNames))
      .catch(handleError)
  }

  return self
}

module.exports = Sheet
