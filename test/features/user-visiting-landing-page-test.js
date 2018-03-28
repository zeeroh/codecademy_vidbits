const {assert} = require('chai');

// NOTE: I cannot understand the instructions in step 30. It's not
// clear to me what the random URL is supposed to be used for. :(
const generateRandomUrl = (domain) => {
  return `http://${domain}/${Math.random()}`;
};

const getTestVideo = () => {
  const videoTitle = 'Test Video 1';
  const videoDescription = 'Test Description 1';
  const videoUrl = 'https://www.youtube.com/embed/6lutNECOZFw';
  return ({title: videoTitle, description: videoDescription, url: videoUrl});
};

const submitTestVideo = (videoObject) => {
  browser.url('/videos/create');
  browser.setValue('#title-input', videoObject.title);
  browser.setValue('#description-input', videoObject.description);
  browser.setValue('#url-input', videoObject.url);
  browser.click('#submit-button');
  browser.url('/');
};



describe('When user visits landing page', () => {
  describe('with no existing videos', () => {

    it('the videos-container element is empty', () => {
      // setup
      const expected = ''; // ie: empty

      // exercise
      browser.url('/');

      // verification
      const actual = browser.getText('#videos-container');
      assert.equal(expected, actual);
    });

  });

  describe('can navigate', () => {
    it('to the /videos/create page', () => {
      // Setup
      const expectedText = 'Save a video';

      // Exercise
      browser.url('/');
      browser.click('a[href="/videos/create"]');

      // Verification
      const pageText = browser.getText('body');
      assert.include(pageText, expectedText);
    });
  });

  describe('with existing video', () => {
    it('renders the existing video', () => {
      // setup
      const testVideo = getTestVideo();

      // exercise
      submitTestVideo(testVideo);

      // verification
      const renderedTitle = browser.getText('#videos-container');
      assert.equal(renderedTitle, testVideo.title);
    });

    it('renders the existing video media in an iframe', () => {
      // setup
      const testVideo = getTestVideo();

      // exercise
      submitTestVideo(testVideo);

      // verification
      const renderedVideoContainer = browser.getHTML('#videos-container');
      assert.include(renderedVideoContainer, 'iframe');
    });

    it('can navigate to the individual video page', () => {
      // setup
      const testVideo = getTestVideo();

      // exercise
      submitTestVideo(testVideo);
      browser.click('.video-page-link');

      // verify
      const renderedVideoDescription = browser.getText('.video-description');
      assert.include(renderedVideoDescription, testVideo.description);
    });

  });

});
