// NOTE: had a difficult time understanding what steps 34 - 37 were
// specifically asking. The instructions were much too vague. I did
// my best to implement what I thought was required.

const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');

const app = require('../../app');
const Video = require('../../models/video');

const {parseTextFromHTML, seedVideoToDatabase, buildVideoObject} = require('../test-utils');
const {connectDatabase, diconnectDatabase} = require('../setup-teardown-utils');




const findIframeElementBySource = (htmlAsString, src) => {
  const iframe = jsdom(htmlAsString).querySelector(`iframe[src="${src}"]`);
  if (iframe !== null) {
    return iframe;
  } else {
    throw new Error(`Iframe with src "${src}" not found in HTML string`);
  }
}



describe('Server path: /', () => {

  beforeEach(connectDatabase);
  afterEach(diconnectDatabase);

  describe('GET', () => {

    it('renders a video with correct title', async () => {
      // setup:
      const video = await seedVideoToDatabase();
      // exercise:
      const response = await request(app)
        .get(`/`);
      // verify:
      assert.include(parseTextFromHTML(response.text, '.video-title'), video.title);
    });

  });
});



describe('Server path: /videos/:id', () => {

  beforeEach(connectDatabase);
  afterEach(diconnectDatabase);

  describe('GET', () => {

    it('renders the video with a title and description', async () => {
      // setup:
      const video = await seedVideoToDatabase();
      // exercise:
      const response = await request(app)
        .get('/videos/' + video._id);
      // verify:
      assert.include(parseTextFromHTML(response.text, `.video-title`), video.title);
      assert.include(parseTextFromHTML(response.text, `.video-description`), video.description);
    });

    it('renders the video in an iframe', async () => {
      // setup:
      const video = await seedVideoToDatabase();
      // exercise:
      const response = await request(app)
        .get('/videos/' + video._id);
      // verify:
      const iframeElem = findIframeElementBySource(response.text, video.url);
      assert.equal(iframeElem.src, video.url);
    });

  });

});



describe('Server path: /videos/:id/edit', () => {

  beforeEach(connectDatabase);
  afterEach(diconnectDatabase);

  describe('GET', () => {

    it('renders a form for the video to be edited', async () => {
      // setup:
      const video = await seedVideoToDatabase();
      // exercise:
      const response = await request(app)
        .get('/videos/' + video._id + '/edit');
      // verify:
      assert.include(response.text, 'form class="input-form"');
    });

  });
});



describe('Server path: /videos/updates', () => {

  beforeEach(connectDatabase);
  afterEach(diconnectDatabase);

  describe('POST', () => {

    it('video in database matches the updated title, description and URL', async () => {
      // setup:
      const videoToCreate = buildVideoObject();
      const video = await seedVideoToDatabase(videoToCreate);
      videoToCreate.id = video._id;

      // exercise:
      const response = await request(app)
        .post('/videos/updates')
        .type('form')
        .send(videoToCreate);
      const createdVideo = await Video.findOne({title: videoToCreate.title});

      // verify:
      assert.equal(videoToCreate.title, createdVideo.title);
      assert.equal(videoToCreate.description, createdVideo.description);
      assert.equal(videoToCreate.url, createdVideo.url);
    });

    it('responds with a 302 status code', async () => {
      // setup:
      const videoToCreate = buildVideoObject();
      const video = await seedVideoToDatabase(videoToCreate);
      videoToCreate.id = video._id;

      // exercise:
      const response = await request(app)
        .post('/videos/updates')
        .type('form')
        .send(videoToCreate);

      // verify:
      assert.equal(response.status, 302);
    });

    describe('when the title is missing', () => {

      // STEP 20:
      it('does not create video entry if submitted title is empty', async () => {
        // setup
        const expectedNumberOfVideos = 0;
        const invalidVideoToCreate = {title: '', description: 'test video description', url: 'http://test.com/test'};
        const video = await seedVideoToDatabase(invalidVideoToCreate);
        invalidVideoToCreate.id = video._id;

        // exercise
        const reponse = await request(app)
          .post('/videos/updates')
          .type('form')
          .send(invalidVideoToCreate);
        const allVideos = await Video.find({'title': ''});

        // verify
        const actualNumberOfVideos = allVideos.length;
        assert.equal(actualNumberOfVideos, expectedNumberOfVideos);
      });

      it('responds with status 400 and displays error', async () => {
        // setup:
        const invalidVideoToCreate = {title: '', description: 'test video description', url: 'http://test.com/test'};
        const video = await seedVideoToDatabase(invalidVideoToCreate);
        invalidVideoToCreate.id = video._id;
        
        // exercise:
        const response = await request(app)
          .post('/videos/updates')
          .type('form')
          .send(invalidVideoToCreate);
        const allVideos = await Video.find({});

        // verify:
        assert.equal(response.status, 400);
        assert.include(parseTextFromHTML(response.text, 'form'), 'required');
      });

      it('renders the validation error message', async () => {
        // setup:
        const invalidVideoToCreate = {title: '', description: 'test video description', url: 'http://test.com/test'};
        const video = await seedVideoToDatabase(invalidVideoToCreate);
        invalidVideoToCreate.id = video._id;

        // exercise:
        const response = await request(app)
          .post('/videos/updates')
          .type('form')
          .send(invalidVideoToCreate);
        const allVideos = await Video.find({});

        // verify:
        assert.include(parseTextFromHTML(response.text, 'form'), 'required');
      });

    });

  });
});



describe('Server path: /videos/deletions', () => {

  beforeEach(connectDatabase);
  afterEach(diconnectDatabase);

    it('removes the video entry', async () => {
      // setup
      const videoToCreate = buildVideoObject();
      const video = await seedVideoToDatabase(videoToCreate);
      videoToCreate.id = video._id;
      // exercise:
      const response = await request(app)
        .post('/videos/deletions')
        .type('form')
        .send(videoToCreate);
      const deletedVideo = await Video.find(videoToCreate);

      // verify
      assert.equal(deletedVideo.length, 0);
    });

});



describe('POST /videos/create', () => {

  beforeEach(connectDatabase);
  afterEach(diconnectDatabase);

  it('responds with a 302 status code', async () => {
    // setup:
    const videoToCreate = buildVideoObject();
    // exercise:
    const response = await request(app)
      .post('/videos/create')
      .type('form')
      .send(videoToCreate);
    // verify:
    assert.equal(response.status, 302);
  });

  it('item in database matches the submitted title, description and URL', async () => {
    // setup:
    const videoToCreate = buildVideoObject();
    // exercise:
    const response = await request(app)
      .post('/videos/create')
      .type('form')
      .send(videoToCreate);
    const createdVideo = await Video.findOne(videoToCreate);
    // verify:
    assert.equal(videoToCreate.title, createdVideo.title);
    assert.equal(videoToCreate.description, createdVideo.description);
    assert.equal(videoToCreate.url, createdVideo.url);
  });

  // STEP 14: (Not totally sure what the instructions are
  // asking for here, but I think this is what it wants...)
  it('returns the submitted data', async () => {
    // setup:
    const videoToCreate = buildVideoObject();
    // exercise:
    const response = await request(app)
      .post('/videos/create')
      .type('form')
      .send(videoToCreate);
    // verify:
    assert.include(parseTextFromHTML(response.text, `.video-title`), videoToCreate.title);
    assert.include(parseTextFromHTML(response.text, `.video-description`), videoToCreate.description);
  });

  describe('when the title is missing', () => {

    // STEP 20:
    it('does not create video entry if submitted title is empty', async () => {
      // setup
      const expectedNumberOfVideos = 0;
      const invalidVideoToCreate = {title: '', description: 'test video description', url: 'http://test.com/test'};

      // exercise
      const reponse = await request(app)
        .post('/videos/create')
        .type('form')
        .send(invalidVideoToCreate);
      const allVideos = await Video.find({'title': ''});

      // verify
      const actualNumberOfVideos = allVideos.length;
      assert.equal(actualNumberOfVideos, expectedNumberOfVideos);
    });

    it('responds with status 400 and displays error', async () => {
      // setup:
      const invalidVideoToCreate = {title: '', description: 'test video description', url: 'http://test.com/test'};
      // exercise:
      const response = await request(app)
        .post('/videos/create')
        .type('form')
        .send(invalidVideoToCreate);
      const allVideos = await Video.find({});
      // verify:
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('renders the validation error message', async () => {
      // setup:
      const invalidVideoToCreate = {title: '', description: 'test video description', url: 'http://test.com/test'};
      // exercise:
      const response = await request(app)
        .post('/videos/create')
        .type('form')
        .send(invalidVideoToCreate);
      const allVideos = await Video.find({});
      // verify:
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

  });
});
