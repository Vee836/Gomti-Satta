const cron = require('node-cron');
const Result = require('./models/Result');

// Run every minute to check for scheduled results
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Find results that are pending and their scheduled date has passed
    const resultsToExecute = await Result.find({
      status: 'pending',
      scheduledDate: { $lte: now }
    });

    for (let result of resultsToExecute) {
      result.status = 'executed';
      result.history.push({
        changes: 'Automatically executed scheduled update',
        timestamp: new Date()
      });
      await result.save();
      console.log(`Executed scheduled result: ${result.title}`);
    }
  } catch (error) {
    console.error('Error executing scheduled results:', error);
  }
});

console.log('Scheduler initialized');
