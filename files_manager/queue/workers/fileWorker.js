const fileQueue = require('../fileQueue');

// Process tasks in the queue
fileQueue.process(async (job) => {
  const { filename } = job.data;

  console.log(`Processing file upload: ${filename}`);

  // Simulate a file upload task (replace with actual logic)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log(`File ${filename} processed successfully.`);
  return { success: true, message: `File ${filename} processed.` };
});
