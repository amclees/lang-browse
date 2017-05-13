container = document.getElementById('container');

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, responseFunction) {
  if (browser.runtime.id === sender.extensionId) {
    if (request.hasOwnProperty('matchingWords')) {
      setupPopup(request.matchingWords);
    }
  }
}

function setupPopup(matchingWords) {
  while (container.hasChildNodes()) {
    container.removeChild(node.lastChild);
  }

  for (var i = 0; i < matchingWords.length; i++) {
    var word = matchingWords[i];
    container.appendChild(document.createElement('hr'));
    container.appendChild(getWordDisplay(word));
  }
}

function getWordDisplay(word) {
  var kana = word.kana;
  var kanji = word.kanji;
  var meanings = word.sense;

  var header = document.createElement('h3');
  var headerText = '';
  if(kana.length === 0) {
    headerText = kanji[0].text;
  } else if(kanji.length === 0 || !kanji[0].common) {
    headerText = kana[0].text;
  } else {
    headerText = kanji[0].text + ' (' + kana[0].text + ')';
  }
  header.innerText = headerText;

  var meaningsList = document.createElement('ol');
  for(var i = 0; i < meanings.length; i++) {
    var meaning = meanings[i];
    var listItem = document.createElement('li');
    listItem.innerText = meaning.gloss.map(function(item) {
      return item.text;
    }).join(', ');
    meaningsList.appendChild(listItem);
  }

  var meaningsDiv = document.createElement('div');
  meaningsDiv.appendChild(meaningsList);

  var wordDiv = document.createElement('div');
  wordDiv.appendChild(header);
  wordDiv.appendChild(meaningsDiv);

  return wordDiv;
}