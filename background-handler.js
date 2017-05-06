// Background scripts run in their own thread, so a blocking request is OK.
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

function handleMessage(request, sender, responseFunction) {
  if(browser.runtime.id === sender.extensionId) {
    if(request.hasOwnProperty('words')) {
      handleAnalysis(request.words);
    }
  }
}

function handleAnalysis(wordHash) {
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
}

browser.runtime.onMessage.addListener(handleMessage);
