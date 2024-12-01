const mongoose = require('mongoose');
const File = require('../../models/file'); // Adjust the path if necessary

describe('File Model Test', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://localhost:27017/testDB', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    // Clean up the database and disconnect
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a File document successfully', async () => {
    const file = new File({
      filename: 'example.txt',
      contentType: 'text/plain',
      size: 1024,
      owner: new mongoose.Types.ObjectId(),
      uploadDate: new Date(),
      fileData: Buffer.from('Hello, world!')
    });

    const savedFile = await file.save();
    expect(savedFile._id).toBeDefined();
    expect(savedFile.filename).toBe('example.txt');
  });

  it('should fail to create a File without required fields', async () => {
    const file = new File({});
    let err;
    try {
      await file.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
  });
});
