var express = require("express");
var router = express.Router();
var hotelReviews = require("../database/repositories/hotelReviewRepository.js");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("index", { title: "Hotel Reviews" });
});

router.get("/positiveReviews/:limit?", async function (req, res, next) {
  let limit = req.params.limit;

  if (limit == undefined || isNaN(+limit) || !Number.isInteger(+limit) || (Number.isInteger(+limit) && +limit < 0)){
    const error = new Error('Invalid input');
    error.status = 400;
    res.render("error",{ error });
    return;
  }
  let reviews = await hotelReviews.getPositiveReviews(+limit);
  res.render("reviews", { title: "Positive Reviews", reviews: reviews });
});

router.get("/negativeReviews/:limit?", async function (req, res, next) {
  let limit = req.params.limit;

  if (limit == undefined || isNaN(+limit) || !Number.isInteger(+limit) || (Number.isInteger(+limit) && +limit < 0)){
    const error = new Error('Invalid input');
    error.status = 400;
    res.render("error",{ error });
    return;
  }

  let reviews = await hotelReviews.getNegativeReviews(+limit);
  res.render("reviews", { title: "Negative Reviews", reviews: reviews });
});

router.get("/review/:id", async function (req, res, next) {
  let id = +req.params.id;

  if (id == undefined || isNaN(+id) || !Number.isInteger(+id) || (Number.isInteger(+id) && +id < 0)){
    const error = new Error('Invalid input');
    error.status = 400;
    res.render("error",{ error });
    return;
  }
  
  let review = await hotelReviews.getReview(+id);
  res.render("listReviews", { reviews: [review] });
});

module.exports = router;
