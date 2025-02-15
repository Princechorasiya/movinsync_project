const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	hasLeft: { type: Boolean, default: false }, // Track if user has left
});

const parkingSpotSchema = new mongoose.Schema({
	location: String,
	pricePerHour: Number,
	slotsAvailable: Number,
	bookedSlots: [bookingSchema], // Embedded bookings
});

const ParkingSpot = mongoose.model("ParkingSpot", parkingSpotSchema);

module.exports = ParkingSpot;
