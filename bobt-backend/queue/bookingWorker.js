module.exports = (bookingQueue, redisClient) => {
	const Parking = require("../models/Parking");

	bookingQueue.process(async (job, done) => {
		try {
			const { parkingId, startTime, endTime, userId } = job.data;
			const parkingSpot = await Parking.findById(parkingId);

			if (!parkingSpot || parkingSpot.slotsAvailable <= 0) {
				return done(new Error("No available slots"));
			}

			// Prevent double booking using Redis lock
			const lockKey = `lock:${parkingId}`;
			const isLocked = await redisClient.get(lockKey);
			if (isLocked) return done(new Error("Slot is already being booked"));

			// Set lock for 5 seconds
			await redisClient.set(lockKey, "locked", "EX", 5);

			// Book the slot
			parkingSpot.slotsAvailable -= 1;
			parkingSpot.bookedSlots.push({ userId, startTime, endTime });
			await parkingSpot.save();

			// Clear Redis cache after modification
			await redisClient.del("parkingSpots");

			done(null, { message: "Booking confirmed" });
		} catch (error) {
			done(error);
		}
	});
};
