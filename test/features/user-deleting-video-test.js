const {assert} = require('chai');
const {buildVideoObject} = require('../test-utils');

const createVideo = (videoToCreate) => {
  browser.url('/videos/create');
  browser.setValue('#title-input', videoToCreate.title);
  browser.setValue('#description-input', videoToCreate.description);
  browser.setValue('#url-input', videoToCreate.url);
  browser.click('#submit-button');
};


describe('User deletes a video', () => {

    it('deleted video title is gone', () => {
      // setup:
      const videoToCreate = buildVideoObject();
      createVideo(videoToCreate);
      // exercise:
      browser.click('#delete');
      // verification
      const result = browser.getText('body').indexOf(videoToCreate.title);
      const expectedValue = -1;
      assert.equal(result, expectedValue);
    });

});
