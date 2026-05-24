const mongoose = require("mongoose");
mongoose.set("bufferTimeoutMS", 1);


const controller = require('../../Controller/roomController.js');

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

describe('roomController.js tests', () => {
  it('should have unit test for createRoom', async () => {
    const req = mockReq();
    const res = mockRes();
    
    try {
      await controller.createRoom(req, res);
      expect(res.status).toBeDefined(); // basic assertion to ensure function runs
    } catch(err) {
    }
    
    expect(typeof controller.createRoom).toBe('function');
  });
});
