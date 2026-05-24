const CustomTourRequest = require("../Model/CustomTourRequest");

// @desc    Create new custom tour request
// @route   POST /api/custom-tours
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const {
      title,
      places,
      hotelRequirements,
      additionalRequirements,
      budget,
      travelDates,
      numPeople,
    } = req.body;

    const customRequest = await CustomTourRequest.create({
      userId: req.user._id,
      title,
      places,
      hotelRequirements,
      additionalRequirements,
      budget,
      travelDates,
      numPeople,
    });

    res.status(201).json({
      status: "success",
      data: customRequest,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Get user's custom tour requests
// @route   GET /api/custom-tours
// @access  Private
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await CustomTourRequest.find({ userId: req.user._id })
      .populate("quotes.tourGuideId", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Get specific request details
// @route   GET /api/custom-tours/:id
// @access  Private
exports.getRequestById = async (req, res) => {
  try {
    const request = await CustomTourRequest.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("quotes.tourGuideId", "fullName email");

    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Request not found",
      });
    }

    const isOwner = request.userId._id.toString() === req.user._id.toString();
    const hasQuote = request.quotes.some(
      (q) => q.tourGuideId._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !hasQuote && req.user.role !== "tourGuide") {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to view this request",
      });
    }

    res.status(200).json({
      status: "success",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Submit bargain/counter-offer
// @route   POST /api/custom-tours/:id/bargain
// @access  Private
exports.submitBargain = async (req, res) => {
  try {
    const { amount, message } = req.body;

    const request = await CustomTourRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Request not found",
      });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized",
      });
    }

    request.bargains.push({
      fromUserId: req.user._id,
      amount,
      message,
    });

    request.status = "bargaining";
    await request.save();

    res.status(200).json({
      status: "success",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Accept a quote
// @route   POST /api/custom-tours/:id/accept
// @access  Private
exports.acceptQuote = async (req, res) => {
  try {
    const { quoteId } = req.body;

    const request = await CustomTourRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Request not found",
      });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized",
      });
    }

    request.acceptedQuote = quoteId;
    request.status = "accepted";
    await request.save();

    res.status(200).json({
      status: "success",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Reject request
// @route   POST /api/custom-tours/:id/reject
// @access  Private
exports.rejectRequest = async (req, res) => {
  try {
    const request = await CustomTourRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Request not found",
      });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized",
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      status: "success",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Cancel request
// @route   DELETE /api/custom-tours/:id
// @access  Private
exports.cancelRequest = async (req, res) => {
  try {
    const request = await CustomTourRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Request not found",
      });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized",
      });
    }

    request.status = "cancelled";
    await request.save();

    res.status(200).json({
      status: "success",
      message: "Request cancelled successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
