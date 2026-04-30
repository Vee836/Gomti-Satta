const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // flexible payload
  scheduledDate: { type: Date },
  status: { type: String, enum: ['pending', 'executed', 'cancelled'], default: 'executed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  history: [{
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changes: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
