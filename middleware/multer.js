const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(filePath)) {
	fs.mkdirSync(filePath, { recursive: true });
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, filePath);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
	},
});

function fileFilter(req, file, cb) {
	cb(null, true);
}

module.exports = multer({ storage: storage, fileFilter });
