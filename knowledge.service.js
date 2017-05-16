var KnowledgeService = {
  shouldShow: function(word, callback) {
    browser.storage.sync.get(word).then(function(matchData) {
      if (matchData.hasOwnProperty(word)) {
        return new Date() > new Date(matchData.word);
      } else {
        return true;
      }
    }, function() {
      return true;
    });
  },
  setForgetDate: function(word, date) {
    browser.storage.sync.set({
      word : date
    });
  }
};
