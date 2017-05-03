function handleAnalysis(request, sender, responseFunction) {
  if(browser.runtime.id === sender.extensionId) {
    if(request.hasOwnProperty('words')) {
      console.log(request.words);
      var wordsByOccurence = [];
      for(var word in request.words) {
        wordsByOccurence.push(word);
      }
      wordsByOccurence.sort(function(word1, word2) {
        return request.words[word2] - request.words[word1];
      });
      console.log(wordsByOccurence);
    }
  }
}

browser.runtime.onMessage.addListener(handleAnalysis);
