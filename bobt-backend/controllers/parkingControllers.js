const Parking = require("../models/Parking");

exports.getParkingSpots = async (req, res) => {
	try {
		const spots = await Parking.find();
		res.json(spots);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

exports.bookParkingSpot = async (req, res) => {
	try {
		const { parkingId, userId, startTime, endTime } = req.body;
		const parkingSpot = await Parking.findById(parkingId);

		if (!parkingSpot) {
			return res.status(404).json({ message: "Parking spot not found" });
		}

		if (parkingSpot.slotsAvailable === 0) {
			return res.status(400).json({ message: "No slots available" });
		}

		parkingSpot.bookedSlots.push({ userId, startTime, endTime });
		parkingSpot.slotsAvailable -= 1;
		await parkingSpot.save();

		res.json({ message: "Parking spot booked successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

exports.cancelBooking = async (req, res) => {
	try {
		const { parkingId, userId } = req.body;
		const parkingSpot = await Parking.findById(parkingId);

		if (!parkingSpot) {
			return res.status(404).json({ message: "Parking spot not found" });
		}

		const bookingIndex = parkingSpot.bookedSlots.findIndex(
			(slot) => slot.userId === userId
		);

		if (bookingIndex === -1) {
			return res
				.status(400)
				.json({ message: "No booking found for this user" });
		}

		parkingSpot.bookedSlots.splice(bookingIndex, 1);
		parkingSpot.slotsAvailable += 1;
		await parkingSpot.save();

		res.json({ message: "Booking canceled successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};
