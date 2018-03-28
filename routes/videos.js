const router = require('express').Router();
const Video = require('../models/video');

router.get('/', async (req, res, next) => {
  const videos = await Video.find({});
  res.render('videos/index', {videos});
});

router.get('/index', async (req, res, next) => {
  const videos = await Video.find({});
  res.render('videos/index', {videos});
});

router.get('/videos/create', async (req, res, next) => {
  res.render('create');
});

router.get('/videos/:videoId', async (req, res, next) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ _id: videoId });
  res.render('videos/show', {video});
});

router.get('/videos/:videoId/edit', async (req, res, next) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ _id: videoId });
  res.render('videos/edit', {video});
});

router.post('/videos/updates', async (req, res, next) => {
  const {title, description, url, id} = req.body;
  await Video.findByIdAndRemove(id);
  const video = new Video({title, description, url});
  video.validateSync();
  if (video.errors) {
    res.status(400).render('videos/edit', {video: video});
  } else {
    await video.save();
    res.status(302).render('videos/show', {video: video});
  }
});

router.post('/videos/deletions', async (req, res, next) => {
  const videoId = req.body.id;
  await Video.findByIdAndRemove(videoId);
  const videos = await Video.find({});
  res.status(302).render('videos/index', {videos});
});

router.post('/videos/create', async (req, res, next) => {
  const {title, description, url} = req.body;
  const video = new Video({title, description, url});
  video.validateSync();
  if (video.errors) {
    res.status(400).render('create', {video: video});
  } else {
    await video.save();
//    res.status(201).render('videos/show', {video: video});
    res.status(302).render('videos/show', {video: video});
  }
});

module.exports = router;
