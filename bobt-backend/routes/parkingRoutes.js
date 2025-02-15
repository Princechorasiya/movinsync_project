const express = require("express");
const router = express.Router();
const ParkingSpot = require("../models/Parking");
const authMiddleware = require("../middleware/auth");

// Get all parking spots (with availability status)
router.get("/", authMiddleware, async (req, res) => {
	try {
		const userId = req.userId; // Now fetched from authMiddleware

		// Fetch all parking spots
		const spots = await ParkingSpot.find();
		console.log(spots);
		// Modify response to include booked and available slots
		const formattedSpots = spots.map((spot) => {
			const userBookings = spot.bookedSlots.filter(
				(slot) => slot.userId === userId
			);

			return {
				...spot.toObject(),

				userBookings,
			};
		});

		res.json(formattedSpots);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching parking spots" });
	}
});
const mongoose = require("mongoose");

// Book a parking spot
router.post("/book", authMiddleware, async (req, res) => {
	const { parkingId, startTime, endTime } = req.body;
	const userId = req.user._id;

	try {
		const spot = await ParkingSpot.findById(parkingId);
		if (!spot) return res.status(404).json({ message: "Spot not found" });

		if (spot.slotsAvailable <= 0)
			return res.status(400).json({ message: "No slots available" });

		// Add new booking
		spot.bookedSlots.push({
			userId,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			hasLeft: false,
		});

		// Decrease available slots
		spot.slotsAvailable -= 1;
		await spot.save();

		res.json({ message: "Booking confirmed" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Booking failed" });
	}
});

// Cancel a specific booking
router.post("/cancel", authMiddleware, async (req, res) => {
	const { parkingId, bookingId } = req.body;
	const userId = req.user._id;

	try {
		const spot = await ParkingSpot.findById(parkingId);
		if (!spot) return res.status(404).json({ message: "Spot not found" });

		// Find the booking
		const bookingIndex = spot.bookedSlots.findIndex(
			(booking) =>
				booking._id.toString() === bookingId &&
				booking.userId.toString() === userId
		);

		if (bookingIndex === -1)
			return res.status(404).json({ message: "Booking not found" });

		// Mark user as left
		spot.bookedSlots[bookingIndex].hasLeft = true;

		// Free the slot if time expired
		if (new Date() > spot.bookedSlots[bookingIndex].endTime) {
			spot.bookedSlots.splice(bookingIndex, 1); // Remove expired booking
			spot.slotsAvailable += 1; // Increase available slots
		}

		await spot.save();
		res.json({ message: "Booking canceled successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Cancellation failed" });
	}
});
// const cron = require("node-cron");

// cron.schedule("* * * * *", async () => {
// 	try {
// 		const spots = await ParkingSpot.find();
// 		for (let spot of spots) {
// 			spot.bookedSlots = spot.bookedSlots.filter((booking) => {
// 				const expired = new Date() > booking.endTime;
// 				if (expired && booking.hasLeft) spot.slotsAvailable += 1;
// 				return !expired || !booking.hasLeft; // Remove only if expired AND user has left
// 			});
// 			await spot.save();
// 		}
// 		console.log("Expired bookings cleaned up.");
// 	} catch (error) {
// 		console.error("Error clearing expired bookings:", error);
// 	}
// });

module.exports = router;
