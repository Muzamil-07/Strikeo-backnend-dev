const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const httpResponse = require("express-http-response");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/index.js");
const passport = require("passport");
const bodyParser = require("body-parser");
const scheduleTop10BrandsJob = require("./Jobs/Top10Brands.js");
const schedulePathaoTokenCheckJob = require("./Jobs/PathaoToken/Runner.js");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = isProd ? 3000 : 8000;
const mongo_uri = isProd
  ? process.env.MONGO_URI_PROD
  : process.env.MONGO_URI_DEV;
const whitelist = [process.env.BACKEND_URL, process.env.FRONTEND_URL];

mongoose
  .connect(mongo_uri)
  .catch((err) => {
    console.error("Failed to connect to database");
    console.error(`Error: ${err}`);
    process.exit(0);
  })
  .then(() => {
    scheduleTop10BrandsJob();
    schedulePathaoTokenCheckJob()
    console.log(
      `Connected to db in ${process.env.NODE_ENV || "development"} environment`
    );
  });

mongoose.set("debug", true);

require("./middleware/passport.js");
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(router);
app.use(httpResponse.Middleware);
app.use(express.static("public"));

// Capture the server instance
const server = app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}.`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.name} : ${err.message}`);

  // Optionally, log the stack trace for better debugging
  console.error(err.stack);

  console.log("Shutting down the server...");

  // Close the server and exit the process
  server.close(() => {
    console.log("Server closed successfully.");
    process.exit(1); // Exit with failure
  });

  // If the server takes too long to close, force the exit
  setTimeout(() => {
    console.error("Forcing shutdown due to timeout.");
    process.exit(1);
  }, 30000); // 30 seconds timeout
});
