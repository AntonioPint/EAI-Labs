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


// 
var train = require("../classification/train.js")
var stpw = require("../classification/stopwords.js")
var stemmr = require("../classification/stemming.js")
var ngram = require("../classification/tokenization.js");
const preprocessing = require("../classification/preprocessing.js");
// 

router.get("/test", async function (req, res, next) {
  let a = "The  quick brown  fox jumps over  the lazy dog. Meanwhile,  the cat is sleeping  peacefully under  the tree."

  res.send(preprocessing(a, [1,2,3], ["brown", "dog"]))
});

// router.get("/test", async function (req, res, next) {
//   try {
//     const trainingSet = await train.getTrainingSet(0);
//     res.send(trainingSet);
//   } catch (error) {
//     console.error("Error fetching training set:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

module.exports = router;
