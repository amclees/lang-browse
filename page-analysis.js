var wordBlacklist = ['the', 'of', 'and', 'an', 'a', 'be', 'in', 'this', 'when', 'to', 'it', 'can', 'or', 'by', 'as', 'is', 'than', 'for', 'are', 'with', 'if', 'am', 'i'];

var validElements = ['p', 'li'];

function getWords() {
  var words = {};
  for(var i = 0; i < validElements.length; i++) {
    var pageElements = document.getElementsByTagName(validElements[i]);
    for(var j = 0; j < pageElements.length; j++) {
      var text = pageElements[j].innerText.trim().toLowerCase();
      text = text.replace(/[^a-z]+/g, ' ');
      var textWords = text.split(' ');
      for(var k = 0; k < textWords.length; k++) {
        var word = textWords[k];
        if(word === '' || wordBlacklist.indexOf(word) !== -1) continue;
        if(words.hasOwnProperty(word)) {
          words[word]++;
        } else {
          words[word] = 1;
        }
      }
    }
  }
  return words;
}

window.setTimeout(function() {
  words = getWords();
  console.log(words);
  browser.runtime.sendMessage({
    'words': words
  });
}, 3500);
