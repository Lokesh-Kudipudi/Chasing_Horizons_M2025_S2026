const Favourite = require("../Model/Favourite");

exports.addFavourite = async (req, res) => {
  try {
    const { tourId } = req.body;
    const userId = req.user._id;

    const existing = await Favourite.findOne({ userId, tourId });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Tour already in favourites",
      });
    }

    const favourite = await Favourite.create({ userId, tourId });

    res.status(201).json({
      status: "success",
      data: favourite,
    });
  } catch (error) {
    console.error("Error adding favourite:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add favourite",
    });
  }
};

exports.removeFavourite = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user._id;

    const result = await Favourite.findOneAndDelete({ userId, tourId });

    if (!result) {
      return res.status(404).json({
        status: "fail",
        message: "Favourite not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Favourite removed",
    });
  } catch (error) {
    console.error("Error removing favourite:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to remove favourite",
    });
  }
};

exports.getUserFavourites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favourites = await Favourite.find({ userId }).populate("tourId");

    res.status(200).json({
      status: "success",
      data: favourites,
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch favourites",
    });
  }
};

exports.checkFavourite = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user._id;

    const favourite = await Favourite.findOne({ userId, tourId });

    res.status(200).json({
      status: "success",
      isFavourited: !!favourite,
    });
  } catch (error) {
    console.error("Error checking favourite:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check favourite",
    });
  }
};
