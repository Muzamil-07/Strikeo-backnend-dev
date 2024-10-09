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
  .then((r) => {
    scheduleTop10BrandsJob();
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

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}.`);
});

process.on("unhandledRejection", function (err) {
  console.log(`${err.name} : ${err.message}`);
  console.log(`Server is shutting down ......`);
  server.close(function () {
    process.exit(1);
  });
});
