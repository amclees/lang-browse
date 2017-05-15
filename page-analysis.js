var validElements = ['a', 'button', 'label', 'li', 'p', 'td'];

function getTexts() {
  var start = Date.now();
  var texts = [];
  for (var i = 0; i < validElements.length; i++) {
    var pageElements = document.getElementsByTagName(validElements[i]);
    for (var j = 0; j < pageElements.length; j++) {
      texts.push(pageElements[j].innerText);
    }
  }
  var elapsed = Date.now() - start;
  console.log(elapsed + ' ms elapsed pulling text from DOM');
  return texts;
}

if(document.contentType === 'text/html') {
  window.setTimeout(function() {
    texts = getTexts();
    console.log(texts);
    browser.runtime.sendMessage({
      'texts': texts
    });
  }, 3500);
}
