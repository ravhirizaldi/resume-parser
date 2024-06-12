'use strict';
const path = require('path'),
  _ = require('underscore'),
  textract = require('textract'),
  mime = require('mime-types'),
  fs = require('fs'),
  logger = require('tracer').colorConsole();
  const dictionary = require('../../dictionary.js');

module.exports.runFile = processFile;
module.exports.runUrl = processUrl;

/**
 *
 * @param file
 * @param cbAfterProcessing
 */
function processFile(file, cbAfterProcessing) {
  extractTextFile(file, function(PreparedFile, error) {
    if (_.isFunction(cbAfterProcessing)) {
      if (error) {
        return cbAfterProcessing(null, error);
      }
      cbAfterProcessing(PreparedFile);
    } else {
      logger.error('cbAfterProcessing should be a function');
      cbAfterProcessing(null, 'cbAfterProcessing should be a function');
    }
  });
}

function processUrl(url, cbAfterProcessing) {
  extractTextUrl(url, function(data, error) {
    if (_.isFunction(cbAfterProcessing)) {
      if (error) {
        return cbAfterProcessing(null, error);
      }
      cbAfterProcessing(data);
    } else {
      logger.error('cbAfterProcessing should be a function');
      cbAfterProcessing(null, 'cbAfterProcessing should be a function');
    }
  });
}

/**
 *
 * @param data
 * @returns {string}
 */
function cleanTextByRows(data) {
  var rows,
    clearRow,
    clearRows = [];

  rows = data.split('\n');
  for (var i = 0; i < rows.length; i++) {
    clearRow = cleanStr(rows[i]);
    if (clearRow) {
      clearRows.push(clearRow);
    }
  }

  return clearRows.join('\n') + '\n{end}';
}

/**
 *
 * @param file
 * @param cbAfterExtract
 */
function extractTextFile(file, cbAfterExtract) {
  logger.trace(file);
  textract.fromFileWithPath(file, { preserveLineBreaks: true }, function(
    err,
    data
  ) {
    if (err) {
      logger.error(err);
      return cbAfterExtract(null, err);
    }
    if (_.isFunction(cbAfterExtract)) {
      data = cleanTextByRows(data);
      var File = new PreparedFile(file, data.replace(/^\s/gm, ''));
      cbAfterExtract(File);
    } else {
      logger.error('cbAfterExtract should be a function');
      return cbAfterExtract(null, 'cbAfterExtract should be a function');
    }
  });
}

function extractTextUrl(url, cbAfterExtract) {
  logger.trace(url);
  textract.fromUrl(url, { preserveLineBreaks: true }, function(err, data) {
    if (err) {
      logger.error(err);
      return cbAfterExtract(null, err);
    }
    if (_.isFunction(cbAfterExtract)) {
      data = cleanTextByRows(data);
      cbAfterExtract(data);
    } else {
      logger.error('cbAfterExtract should be a function');
      return cbAfterExtract(null, 'cbAfterExtract should be a function');
    }
  });
}

/**
 *
 * @param str
 * @returns {string}
 */
function cleanStr(str) {
  return str.replace(/\r?\n|\r|\t|\n/g, '').trim();
}

function PreparedFile(file, raw) {
  this.path = file;
  this.mime = mime.lookup(file);
  this.ext = mime.extension(this.mime);
  this.raw = raw;
  this.name = path.basename(file);
}

/**
 *
 * @param Resume
 */
PreparedFile.prototype.addResume = function(Resume) {
  this.resume = Resume;
};

PreparedFile.prototype.saveResume = function(path, cbSavedResume) {
  path = path || __dirname;

  if (!_.isFunction(cbSavedResume)) {
    return logger.error('cbSavedResume should be a function');
  }

  if (fs.statSync(path).isDirectory() && this.resume) {
    //open file
      const resume = this.resume;
      

      //count dictionary objects and subobjects
      let dictionaryCount = 0;

      for (let key in dictionary) {
        for (let subkey in dictionary[key]) {
          if (dictionary[key].hasOwnProperty(subkey)) {
            dictionaryCount++;
          }
        }
      }

      //count resume objects (resume.parts)
      let resumeCount = 0;

      for (let key in resume.parts) {
        if (resume.parts.hasOwnProperty(key)) {
          resumeCount++;
        }
      }

      //percentage of resume objects to dictionary objects
      let percentage = (resumeCount / (dictionaryCount - 10)) * 100;

      //add to resume object
      const resumeData = {
        resume: resume.parts,
        resumeCount: resumeCount,
        dictionaryCount: (dictionaryCount - 10),
        //decimal 2
        score: Math.round(percentage * 100) / 100,
        stars: Math.round(percentage * 5) / 100,
      };

      fs.writeFile(
        path + '/' + this.name + '.json',
        JSON.stringify(resumeData, null, 2),
        cbSavedResume
      );
    }
};
