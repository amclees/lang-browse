browser.storage.local.remove('matchData');

var validElements = ['a', 'button', 'label', 'li', 'p', 'td'];
var elementTimeout = 5;

function getTexts(callback) {
  var start = Date.now();
  var texts = [];
  nextElement();

  function nextElement() {
    if (validElements.length === 0) {
      callback(texts);
      return;
    }
    tag = validElements.pop();

    var pageElements = document.getElementsByTagName(tag);
    var element = 0;
    nextPageElement();

    function nextPageElement() {
      if (pageElements.length === element) {
        nextElement();
        return;
      }
      if(Date.now() - start > 15000) {
        console.log('Too many elements, terminating early');
        nextElement();
        return;
      }
      texts.push(pageElements[element].innerText);
      element += 1;
      setTimeout(nextPageElement, elementTimeout);
    }
  }
}

if (document.contentType === 'text/html') {
  setTimeout(function() {
    getTexts(function(texts) {
      console.log(texts);
      browser.runtime.sendMessage({
        'texts': texts
      });
    });
  }, 500);
}
