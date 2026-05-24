const { Hotel } = require("../Model/hotelModel");
const { Tour } = require("../Model/tourModel");
const { User } = require("../Model/userModel");


async function assignHotelToEmployee(req, res) {
    try {
        const { hotelId } = req.params;
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ status: "error", message: "Employee ID is required" });
        }

        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== "employee") {
            return res.status(400).json({ status: "error", message: "Invalid Employee ID or user is not an employee" });
        }

        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({ status: "error", message: "Hotel not found" });
        }

        if ((hotel.status || "").toLowerCase() !== "active") {
            return res.status(400).json({
                status: "error",
                message: "Hotel must be approved (active) before assigning an employee",
            });
        }

        hotel.assignedEmployeeId = employeeId;
        await hotel.save();

        res.status(200).json({ status: "success", data: hotel });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}


async function assignTourToEmployee(req, res) {
    try {
        const { tourId } = req.params;
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ status: "error", message: "Employee ID is required" });
        }

        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== "employee") {
            return res.status(400).json({ status: "error", message: "Invalid Employee ID or user is not an employee" });
        }

        const tour = await Tour.findById(tourId);

        if (!tour) {
            return res.status(404).json({ status: "error", message: "Tour not found" });
        }

        if ((tour.status || "").toLowerCase() !== "active") {
            return res.status(400).json({
                status: "error",
                message: "Tour must be approved (active) before assigning an employee",
            });
        }

        tour.assignedEmployeeId = employeeId;
        await tour.save();

        res.status(200).json({ status: "success", data: tour });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}

module.exports = {
    assignHotelToEmployee,
    assignTourToEmployee,
};
