const {assert} = require('chai');
const {buildVideoObject} = require('../test-utils');

const createVideo = (videoToCreate) => {
  browser.url('/videos/create');
  browser.setValue('#title-input', videoToCreate.title);
  browser.setValue('#description-input', videoToCreate.description);
  browser.setValue('#url-input', videoToCreate.url);
  browser.click('#submit-button');
};

const updateVideo = (videoParameters) => {
  browser.click('#edit');
  browser.setValue('#title-input', videoParameters.title);
  browser.setValue('#description-input', videoParameters.description);
  browser.setValue('#url-input', videoParameters.url);
  browser.click('#submit-button');
};

describe('User updating video', () => {
  describe('edits the title of existing video,', () => {

    it('new title is rendered', () => {
      // setup:
      const expectedValue = 'Updated Test Title'
      const videoToCreate = buildVideoObject();
      const updatedVideoParameters = buildVideoObject({title: expectedValue});
      createVideo(videoToCreate);
      // exercise:
      updateVideo(updatedVideoParameters);
      // verification
      assert.include(browser.getText('body'), expectedValue);
    });

    it('update does not create new video (old title is not rendered)', () => {
      // setup:
      const updatedValue = 'Updated Test Title'
      const videoToCreate = buildVideoObject();
      const updatedVideoParameters = buildVideoObject({title: updatedValue});
      createVideo(videoToCreate);
      // exercise:
      updateVideo(updatedVideoParameters);
      const oldValue = videoToCreate.title;
      
      // verification ( make sure old value is no longer in the list ):
      assert.equal(browser.getText('body').indexOf(oldValue), -1);
    });

  });
});
