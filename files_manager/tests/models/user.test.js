const mongoose = require('mongoose');
const User = require('../../models/user');

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should hash the password before saving', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'plaintextpassword'
    });

    const savedUser = await user.save();
    expect(savedUser.password).not.toBe('plaintextpassword');
  });

  it('should correctly compare passwords', async () => {
    const user = new User({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'mypassword'
    });

    await user.save();
    const isMatch = await user.comparePassword('mypassword');
    expect(isMatch).toBe(true);
  });
});
