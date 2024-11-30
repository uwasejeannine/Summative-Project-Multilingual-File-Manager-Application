const Queue = require('bull');
const redisClient = require('../config/redis');

const fileQueue = new Queue('fileQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Optional: Event listeners for queue debugging
fileQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

fileQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

module.exports = fileQueue;
