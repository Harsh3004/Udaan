const express = require('express');
const { auth, isInstructor } = require('../middlewares/Auth');
const { uploadResource, getCourseResources, deleteResource, incrementDownloads } = require('../controllers/resourceController');
const router = express.Router();

router.post('/upload', auth, isInstructor, uploadResource);
router.get('/:courseId', auth, getCourseResources);
router.delete('/delete/:resourceId', auth, deleteResource);
router.put('/downloads/:resourceId', auth, incrementDownloads);

module.exports = router;