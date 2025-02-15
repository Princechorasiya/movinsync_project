const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

//sert up a queue and a redis chaching server for chaching out the info's
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Database Connection
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.log(err));

// Import Routes
const parkingRoutes = require("./routes/parkingRoutes");
const authRoutes = require("./routes/authroutes");

app.use("/api/parking", parkingRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
