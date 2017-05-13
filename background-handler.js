// Background scripts run in their own thread, so a blocking request is OK.
function loadScript(filename, callback) {
    var scriptElement = document.createElement('script');
    scriptElement.src = browser.extension.getURL('lib/' + filename);
    scriptElement.addEventListener('load', callback, false);
    document.head.appendChild(scriptElement);
}

loadScript('crossfilter.min.js', function() {
  var wordBlacklist = ['the', 'of', 'and', 'an', 'a', 'be', 'in', 'this', 'when', 'to', 'it', 'can', 'or', 'by', 'as', 'is', 'than', 'for', 'are', 'with', 'if', 'am', 'i', 'my'];

  var engDictUrl = browser.extension.getURL('dictionaries/eng.min.json');
  var jpDictUrl = browser.extension.getURL('dictionaries/jmdict_eng.min.json');
  var jpCommonDictUrl = browser.extension.getURL('dictionaries/jmdict_eng_common.min.json');

  var startLoadingDicts = Date.now();
  var engDict = JSON.parse(getHTTP(engDictUrl));
  var jpCommonDict = JSON.parse(getHTTP(jpCommonDictUrl));
  var elapsedLoadingDicts = Date.now() - startLoadingDicts;
  console.log('Loaded all dictionaries in ' + elapsedLoadingDicts + 'ms');

  var jpWords = crossfilter(jpCommonDict.words);
  var jpEngDefs = jpWords.dimension(function(word) {
    return word.sense;
  });

  function handleMessage(request, sender, responseFunction) {
    if (browser.runtime.id === sender.extensionId) {
      if (request.hasOwnProperty('texts')) {
        handleAnalysis(getWords(request.texts));
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

  function handleAnalysis(wordHash) {
    console.log(wordHash);

    var wordsByOccurence = sortWords(wordHash);

    var word = selectWord(wordsByOccurence);

    var matchingWords = jpEngDefs.filterFunction(matchingWordFilter(word));

    var occurencesOfWord = occurencesInDefinition(word);
    var matchingWordsSorted = matchingWords.top(Infinity).sort(function(word1, word2) {
      return occurencesOfWord(word2) - occurencesOfWord(word1);
    });

    console.log(matchingWordsSorted);

    browser.browserAction.setPopup({popup: 'popup.html'});
    browser.browserAction.enable();
    browser.runtime.sendMessage({
      'matchingWords': matchingWordsSorted
    });
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

  function occurencesInDefinition(word) {
    return function(sense) {
      var occurences = 0;
      for (var i = 0; i < sense.length; i++) {
        for (var j = 0; j < sense[i].gloss.length; j++) {
          var text = sense[i].gloss[j].text;
          occurences += occurencesOf(text, word);
        }
      }
      return occurences;
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

  function occurencesOf(text, word) {
      if (text.length < word.length || word.length === 0) {
        return 0;
      }
      var occurences = 0;
      var searchFrom = 0;
      var step = word.length;

      while (searchFrom >= 0) {
          searchFrom = text.indexOf(word, searchFrom);
          if (searchFrom !== -1) {
            occurences++;
            searchFrom += step;
          }
      }
      return n;
  }

  browser.runtime.onMessage.addListener(handleMessage);
});
