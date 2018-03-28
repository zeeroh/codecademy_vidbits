const {assert} = require('chai');
const {buildVideoObject} = require('../test-utils');

describe('User visits the /video/create page', () => {
  describe('posts a new video', () => {

    it('and is rendered', () => {
      // setup (using method in text-utils.js)
      const videoToCreate = buildVideoObject();

      // exercise
      browser.url('/videos/create');
      browser.setValue('#title-input', videoToCreate.title);
      browser.setValue('#description-input', videoToCreate.description);
      browser.setValue('#url-input', videoToCreate.url);
      browser.click('#submit-button');

      // verification
      assert.include(browser.getText('body'), videoToCreate.title);
      assert.include(browser.getText('body'), videoToCreate.description);
      assert.include(browser.getAttribute('iframe', 'src'), videoToCreate.url);
    });

  });
});
