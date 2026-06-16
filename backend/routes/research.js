const express = require('express');
const router = express.Router();
const ResearchJob = require('../models/ResearchJob');
const { runResearchPipeline } = require('../services/agentService');

/**
 * @route   POST /api/research
 * @desc    Start a new research job
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Research topic is required' });
  }

  try {
    const job = new ResearchJob({
      topic: topic.trim(),
      status: 'pending'
    });

    await job.save();

    // Run pipeline asynchronously in the background
    // (Do not await it so we can immediately return the job ID)
    runResearchPipeline(job._id).catch(err => {
      console.error(`Unhandled pipeline error for job ${job._id}:`, err);
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error starting research:', error);
    res.status(500).json({ error: 'Server error while starting research job' });
  }
});

/**
 * @route   GET /api/research
 * @desc    Get all research jobs
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query.topic = { $regex: q, $options: 'i' };
    }

    // Sort by newest first
    const jobs = await ResearchJob.find(query)
      .select('topic status score error createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error while fetching jobs list' });
  }
});

/**
 * @route   GET /api/research/:id
 * @desc    Get details / status of a specific job
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await ResearchJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job details:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Research job not found' });
    }
    res.status(500).json({ error: 'Server error while fetching job details' });
  }
});

/**
 * @route   DELETE /api/research/:id
 * @desc    Delete a research job
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const job = await ResearchJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    await job.deleteOne();
    res.json({ message: 'Research job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Research job not found' });
    }
    res.status(500).json({ error: 'Server error while deleting job' });
  }
});

module.exports = router;
