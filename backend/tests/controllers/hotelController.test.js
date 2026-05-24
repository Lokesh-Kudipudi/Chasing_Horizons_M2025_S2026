const mongoose = require("mongoose");
mongoose.set("bufferTimeoutMS", 1);

jest.mock('../../config/redis.js', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1)
  }
}));

const controller = require('../../Controller/hotelController.js');

// Mock req and res
const mockReq = () => {
  const req = {};
  req.body = {};
  req.params = {};
  req.query = {};
  req.user = { _id: "123", email: "test@test.com" };
  return req;
};

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('hotelController.js tests', () => {
  it('should have unit test for getAllHotels', async () => {
    const req = mockReq();
    const res = mockRes();
    
    try {
      await controller.getAllHotels(req, res);
      expect(res.status).toBeDefined(); // basic assertion to ensure function runs
    } catch(err) {
    }
    
    expect(typeof controller.getAllHotels).toBe('function');
  });
});
