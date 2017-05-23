// To be run in Node.js for generation of HTML big enough to overload analysis
var fs = require('fs');

if (process.argv.length > 2) {
  size = process.argv[2];
} else {
  size = 100000;
}

doc = `<!DOCTYPE html>
<html>
<body>`;

size += 1;
for (var i = 1; i < size; i++) {
  doc += '\n<p>Paragraph number ' + i + '</p>';
}

doc += `
</body>
</html>
`;

fs.writeFile("large-file.html", doc, function(error) {
  if (error) {
    console.log(error);
  }
  console.log("Generated large html file");
});
