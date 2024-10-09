const { Router } = require("express");
const router = Router();
// const fs = require("fs");
// const path = require("path");

const multer = require("../middleware/multer");
const cpUpload = multer.fields([{ name: "file", maxCount: 5 }]);

router.post("/", cpUpload, function (req, res, next) {
	const urlsData = [];
	for (let i = 0; i < req.files["file"].length; i++) {
		urlsData.push({
			[req.files["file"][i].originalname]: `${process.env.BACKEND_URL}/uploads/${req.files["file"][i].filename}`,
		});
	}
	return res.json(urlsData);
});

// router.post("/delete", function (req, res, next) {
// 	if (req.body.url) {
// 		fs.unlink(path.join(process.cwd(), "server/public", req.body.url), function (err) {
// 			if (err) {
// 				return res.sendStatus(204);
// 			}
// 			// if no error, file has been deleted successfully
// 			return res.json({ status: 200, event: "File deleted Successfully" });
// 		});
// 	} else {
// 		if (!event) return res.sendStatus(204);
// 	}
// 	// unlink the files
// });

module.exports = router;
