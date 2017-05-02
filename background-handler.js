function handleAnalysis(request, sender, responseFunction) {
  if(browser.runtime.id === sender.extensionId) {
    if(request.hasOwnProperty('words')) {
      console.log(request.words);
    }
  }
}

browser.runtime.onMessage.addListener(handleAnalysis);
