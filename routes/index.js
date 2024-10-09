const express = require("express");
const api = require("./api/index.js");
const upload = require("./upload.js");

const router = express.Router();

router.use("/api", api);
router.use("/upload", upload);

module.exports = router;
