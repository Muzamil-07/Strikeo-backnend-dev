const express = require("express");
const FavouriteProductsCont = require("../../controllers/FavouriteProduct.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.use(auth.verifyToken);

router.get("/", FavouriteProductsCont.getUserFavorites);
router.post("/add", FavouriteProductsCont.addToFavorites);
router.post("/remove", FavouriteProductsCont.removeFromFavorites);

module.exports = router;
