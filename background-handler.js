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
    wordsByOccurence.push(word);
  }
  wordsByOccurence.sort(function(word1, word2) {
    return wordHash[word2] - wordHash[word1];
  });
  console.log(wordsByOccurence);
}

browser.runtime.onMessage.addListener(handleMessage);
