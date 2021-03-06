browser.browserAction.setPopup({
  popup: "popup.html"
});

var wordBlacklist = ['the', 'of', 'and', 'an', 'at', 'a', 'be', 'in', 'this', 'when', 'to', 'it', 'can', 'or', 'by', 'as', 'is', 'than', 'for', 'are', 'with', 'if', 'am', 'i', 'my', 'that', 'was'];

var engDictUrl = browser.extension.getURL('dictionaries/eng.min.json');
var jpDictUrl = browser.extension.getURL('dictionaries/jmdict_eng.min.json');
var jpCommonDictUrl = browser.extension.getURL('dictionaries/jmdict_eng_common.min.json');

var startLoadingDicts = Date.now();
var engDict = JSON.parse(getHTTP(engDictUrl));
var jpDict = JSON.parse(getHTTP(jpDictUrl));
var elapsedLoadingDicts = Date.now() - startLoadingDicts;
console.log('Loaded all dictionaries in ' + elapsedLoadingDicts + ' ms');

var jpWords = crossfilter(jpDict.words);
var jpEngDefs = jpWords.dimension(function(word) {
  return word.sense;
});

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, responseFunction) {
  if (browser.runtime.id === sender.extensionId) {
    if (request.hasOwnProperty('texts')) {
      var startAnalysis = Date.now();
      handleAnalysis(getWords(request.texts));
      var elapsedAnalysis = Date.now() - startAnalysis;
      console.log('Handled analysis in ' + elapsedAnalysis + ' ms');
    }
  }
}

function getWords(texts) {
  var words = {};
  for (var i = 0; i < texts.length; i++) {
    var text = texts[i].trim().toLowerCase().replace(/[^a-z]+/g, ' ');
    var textWords = text.split(' ');
    for (var j = 0; j < textWords.length; j++) {
      var word = textWords[j];
      if (word === '' || wordBlacklist.indexOf(word) !== -1) continue;
      if (words.hasOwnProperty(word)) {
        words[word]++;
      } else {
        words[word] = 1;
      }
    }
  }
  return words;
}

var analysisCallCount = 0;
function handleAnalysis(wordHash) {
  console.log(wordHash);
  // Call count is to prevent stack overflow when no valid words are found.
  if (++analysisCallCount > 1000) {
    return;
  }

  var wordsByOccurence = sortWords(wordHash);

  var word = selectWord(wordsByOccurence);


  KnowledgeService.shouldShow(word, function(shouldShow) {
    if (shouldShow && analyzeWord(word)) {
      console.log('Finished analysis');
      analysisCallCount = 0;
    } else {
      console.log('Word: ' + word + ' should not be shown, retrying next word.');
      delete wordHash[word];
      handleAnalysis(wordHash);
      return;
    }
  });
}

function analyzeWord(word) {
  var matchingWords = jpEngDefs.filterFunction(matchingWordFilter(word));

  var occurencesOfWord = scoreOfDefinition(word);
  var matchingWordsSorted = matchingWords.top(Infinity).sort(function(word1, word2) {
    return occurencesOfWord(word2) - occurencesOfWord(word1);
  });

  if(matchingWordsSorted.length === 0) {
    return false;
  }

  matchingWordsSorted = matchingWordsSorted.splice(0, 25);

  console.log(matchingWordsSorted);

  browser.storage.local.set({
    'matchData' : {
      'englishWord' : word,
      'matchingWords': matchingWordsSorted
    }
  });
  browser.browserAction.enable();
  return true;
}

function sortWords(wordHash) {
  var wordsByOccurence = [];
  for (var word in wordHash) {
    if (engDict.indexOf(word) != -1) {
      wordsByOccurence.push(word);
    }
  }
  wordsByOccurence.sort(function(word1, word2) {
    return wordHash[word2] - wordHash[word1];
  });
  console.log(wordsByOccurence);
  return wordsByOccurence;
}

function matchingWordFilter(word) {
  return function(sense) {
    for (var i = 0; i < sense.length; i++) {
      for (var j = 0; j < sense[i].gloss.length; j++) {
        var text = sense[i].gloss[j].text;
        if (text.indexOf(word) !== -1) {
          return true;
        }
      }
    }
    return false;
  };
}

function scoreOfDefinition(word) {
  return function(dictionaryWord) {
    sense = dictionaryWord.sense;
    var score = 0;
    for (var i = 0; i < sense.length; i++) {
      var senseModifier = 1 + (1 / (2 * i + 1));
      var senseScore = 0;
      for (var j = 0; j < sense[i].gloss.length; j++) {
        var glossModifier = 1 + (1 / (j + 1));
        var text = sense[i].gloss[j].text;
        var density = (occurencesScore(text, word) * word.length) / (text.length);
        senseScore += glossModifier * density;
      }
      score += senseModifier * senseScore;
    }
    return score;
  };
}

function selectWord(wordsByOccurence) {
  return wordsByOccurence[0];
}

function getHTTP(url) {
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  req.overrideMimeType('application/json');
  req.send();
  return req.responseText;
}

var seperators = [' ', ',', ';', ':', '-', '(', ')'];

function occurencesScore(text, word) {
  if (text.length < word.length || word.length === 0) {
    return 0;
  }
  var occurences = 0;
  var currentWord = '';
  for (var i = 0; i < text.length; i++) {
    var char = text[i];
    var isLast = i + 1 === text.length;
    var isSeperator = seperators.indexOf(char) !== -1;
    if (!isLast && !isSeperator) {
      currentWord += char;
    } else {
      if (isLast && !isSeperator) {
        currentWord += char;
      }
      if (currentWord === word) {
        occurences++;
      } else if (currentWord.indexOf(word) !== -1) {
        occurences += 0.4 * (word.length / currentWord.length);
      }
      currentWord = '';
    }
  }
  return occurences;
}
