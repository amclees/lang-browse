// To be run in Node.js for one-time conversion of line-break seperated word dictionaries to JSON.
var fs = require('fs');
var readline = require('readline');

var reader = readline.createInterface({
  input: fs.createReadStream('to_convert.txt')
});

var words = [];

reader.on('line', function(line) {
  words.push(line);
});

reader.on('close', function() {
  fs.writeFile('converted.json', JSON.stringify(words), 'utf8', function() {
    console.log('Wrote generated JSON to converted.json.');
  });
});
