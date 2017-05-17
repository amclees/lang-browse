var KnowledgeService = {
  shouldShow: function(word, callback) {
    browser.storage.local.get('knownWords').then(function(matchData) {
      console.log(matchData);
      var knownWords = matchData.knownWords;
      if (knownWords.hasOwnProperty(word)) {
        callback(new Date() > new Date(matchData.word));
      } else {
        console.log('Word not in storage: ' + word);
        callback(true);
      }
    }, function(error) {
      console.log('Error getting word knowledge data from sync storage');
      console.log(error);
      callback(true);
    });
  },
  setForgetDate: function(word, date) {
    browser.storage.local.get('knownWords').then(function(matchData) {
      var knownWords = matchData.knownWords;
      console.log('Forget date for: ' + word);
      console.log(date);
      knownWords[word] = date;
      browser.storage.local.set({
        'knownWords' : knownWords
      }).then(function() {
        console.log('Successfully set forget date.');
      },
      function(error) {
        console.log('Error setting forget date:');
        console.log(error);
      });
    });
  }
};
