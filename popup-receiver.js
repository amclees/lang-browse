var container = document.getElementById('container');
var knowledgeTime = document.getElementById('knowledge-time');
var knowledgeButton = document.getElementById('knowledge-button');
var knowledgeInput = document.getElementById('knowledge-input');
var currentWord = '';
var grabbing = false;

textUpdate(knowledgeInput.value);
grabFromStorage();
setInterval(grabFromStorage, 500);

function grabFromStorage() {
  if(grabbing) {
    return;
  }
  grabbing = true;
  var localStorage = browser.storage.local.get('matchData').then(function(got) {
    if (got.hasOwnProperty('matchData') && got.matchData.word !== currentWord) {
      console.log('Setting up popup for new words.');
      currentWord = got.matchData.word;
      setupPopup(got.matchData);
    } else {
      console.log('No match data in storage');
    }
    grabbing = false;
  });
}

function setupPopup(matchData) {
  document.getElementById('header').innerText = matchData.englishWord;
  knowledgeButton.onclick = knowledgeHandler(matchData);
  var matchingWords = matchData.matchingWords;
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
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

function knowledgeHandler(matchData) {
  return function() {
    console.log(getForgetDate());
    KnowledgeService.setForgetDate(matchData.englishWord, getForgetDate());
  };
}

function getLogarithmic(value) {
  return Math.pow(10, value);
}

function getFormattedTime(seconds) {
  var counter = 0;
  var formatted = '';
  seconds = Math.floor(seconds);
  var months = Math.floor(seconds / (86400 * 30));
  if (months !== 0) {
    formatted += months + ' months ';
    counter++;
  }
  if (counter >= 2) return formatted;
  seconds %= (86400 * 30);
  var days = Math.floor(seconds / 86400);
  if (days !== 0) {
    formatted += days + ' days ';
    counter++;
  }
  if (counter >= 2) return formatted;
  seconds %= 86400;
  var hours = Math.floor(seconds / 3600);
  if (hours !== 0) {
    formatted += hours + ' hours ';
    counter++;
  }
  if (counter >= 2) return formatted;
  seconds %= 3600;
  var minutes = Math.floor(seconds / 60);
  if (minutes !== 0) {
    formatted += minutes + ' minutes ';
    counter++;
  }
  if (counter >= 2) return formatted;
  seconds %= 60;
  if (seconds !== 0) {
    formatted += seconds + ' seconds';
    counter++;
  }
  return formatted;
}

function getForgetDate() {
  var value = knowledgeInput.value;
  if (value > knowledgeInput.max - (knowledgeInput.max * 0.05)) {
    return new Date(Number.MAX_SAFE_INTEGER);
  } else {
    var seconds = getLogarithmic(value / 125000);
    return new Date((new Date()).getTime() + (seconds * 1000));
  }
}

function textUpdate(value) {
  if (value > knowledgeInput.max - (knowledgeInput.max * 0.05)) {
    knowledgeTime.innerText = "Forever";
  } else {
    knowledgeTime.innerText = getFormattedTime(getLogarithmic(value / 125000));
  }
}
