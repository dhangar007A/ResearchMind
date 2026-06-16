const mongoose = require('mongoose');

const ResearchJobSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'searching', 'reading', 'writing', 'critiquing', 'completed', 'failed'],
    default: 'pending'
  },
  searchResults: {
    type: String,
    default: ''
  },
  selectedUrl: {
    type: String,
    default: ''
  },
  scrapedContent: {
    type: String,
    default: ''
  },
  report: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResearchJob', ResearchJobSchema);
