// Background scripts run in their own thread, so a blocking request is OK.
function loadScript(filename, callback) {
    var scriptElement = document.createElement('script');
    scriptElement.src = browser.extension.getURL('lib/' + filename);
    scriptElement.addEventListener('load', callback, false);
    document.head.appendChild(scriptElement);
}

loadScript('crossfilter.min.js', function() {
  function getHTTP(url){
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.overrideMimeType('application/json'); 
    req.send();
    return req.responseText;
  }

  var engDictUrl = browser.extension.getURL('dictionaries/converted.json');
  var jpDictUrl = browser.extension.getURL('dictionaries/jmdict_eng.min.json');
  var jpCommonDictUrl = browser.extension.getURL('dictionaries/jmdict_eng_common.min.json');

  var engDict = JSON.parse(getHTTP(engDictUrl));
  var jpCommonDict = JSON.parse(getHTTP(jpCommonDictUrl));
  var jpWords = crossfilter(jpCommonDict.words);
  var jpEngDefs = jpWords.dimension(function(word) {
    return word.sense[0].gloss[0].text;
  });

  function handleMessage(request, sender, responseFunction) {
    if(browser.runtime.id === sender.extensionId) {
      if(request.hasOwnProperty('words')) {
        handleAnalysis(request.words);
      }
    }
  }

  function handleAnalysis(wordHash) {
    console.log(jpCommonDict);
    console.log(wordHash);
    var wordsByOccurence = [];
    for(var word in wordHash) {
      if(engDict.indexOf(word) != -1) {
        wordsByOccurence.push(word);
      }
    }
    wordsByOccurence.sort(function(word1, word2) {
      return wordHash[word2] - wordHash[word1];
    });
    console.log(wordsByOccurence);
    var matchingWords = jpEngDefs.filterFunction(function(text) {
      return text.indexOf(wordsByOccurence[0]) !== -1;
    });
    console.log(matchingWords.top(Infinity));
  }

  browser.runtime.onMessage.addListener(handleMessage);
});
