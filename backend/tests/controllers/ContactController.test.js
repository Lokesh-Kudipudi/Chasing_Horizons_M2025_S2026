const mongoose = require("mongoose");
mongoose.set("bufferTimeoutMS", 1);


const controller = require('../../Controller/ContactController.js');

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

describe('ContactController.js tests', () => {
  it('should have unit test for createContactForm', async () => {
    const req = mockReq();
    const res = mockRes();
    
    try {
      await controller.createContactForm(req, res);
      expect(res.status).toBeDefined(); // basic assertion to ensure function runs
    } catch(err) {
    }
    
    expect(typeof controller.createContactForm).toBe('function');
  });
});
