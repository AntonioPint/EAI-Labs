var express = require("express");
var router = express.Router();
var hotelReviews = require("../database/repositories/hotelReviewRepository.js");

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get home page
 *     responses:
 *       200:
 *         description: Home page
 */
router.get("/", async function (req, res, next) {
  let termCount = await termRepository.getTermCount()
  let termStatisticCount = await termStatisticRepository.getTermStatisticCount()
  res.render("index", { title: "Hotel Reviews" , nTerms: termCount, nTermsStatistic: termStatisticCount});
});

/**
 * @swagger
 * /positiveReviews/{limit}:
 *   get:
 *     summary: Get positive reviews
 *     parameters:
 *       - name: limit
 *         in: path
 *         description: Limit the number of reviews
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of positive reviews
 *       400:
 *         description: Invalid input
 */
router.get("/positiveReviews/:limit?", async function (req, res, next) {
  let limit = req.params.limit;

  if (limit == undefined || isNaN(+limit) || !Number.isInteger(+limit) || (Number.isInteger(+limit) && +limit < 0)) {
    const error = new Error('Invalid input');
    error.status = 400;
    res.render("error", { error });
    return;
  }
  let reviews = await hotelReviews.getPositiveReviews(+limit);
  res.render("reviews", { title: "Positive Reviews", reviews: reviews });
});

/**
 * @swagger
 * /negativeReviews/{limit}:
 *   get:
 *     summary: Get negative reviews
 *     parameters:
 *       - name: limit
 *         in: path
 *         description: Limit the number of reviews
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of negative reviews
 *       400:
 *         description: Invalid input
 */
router.get("/negativeReviews/:limit?", async function (req, res, next) {
  let limit = req.params.limit;

  if (limit == undefined || isNaN(+limit) || !Number.isInteger(+limit) || (Number.isInteger(+limit) && +limit < 0)) {
    const error = new Error('Invalid input');
    error.status = 400;
    res.render("error", { error });
    return;
  }

  let reviews = await hotelReviews.getNegativeReviews(+limit);
  res.render("reviews", { title: "Negative Reviews", reviews: reviews });
});

/**
 * @swagger
 * /review/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Review ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Single review
 *       400:
 *         description: Invalid input
 */
router.get("/review/:id", async function (req, res, next) {
  let id = +req.params.id;

  if (id == undefined || isNaN(+id) || !Number.isInteger(+id) || (Number.isInteger(+id) && +id < 0)) {
    const error = new Error('Invalid input');
    error.status = 400;
    res.render("error", { error });
    return;
  }
  
  let review = await hotelReviews.getReview(+id);
  res.render("listReviews", { reviews: [review] });
});

var train = require("../classification/train.js");
const termRepository = require("../database/repositories/termRepository.js");
const termStatisticRepository = require("../database/repositories/termStatisticRepository.js");

let isProcessing = false;
let isProcessingDone = false;

/**
 * @swagger
 * /processTerms:
 *   get:
 *     summary: Start processing terms
 *     responses:
 *       200:
 *         description: Processing started
 */
router.get("/processTerms", async function (req, res, next) {
  if (!isProcessing) {
    isProcessing = true;
    isProcessingDone = false;

    train.processTerms().then(() => {
      isProcessing = false;
      isProcessingDone = true;
    });
  }

  res.send(`
    <html>
      <head>
        <script>
          setInterval(function() {
            fetch('/checkProcessingStatus')
              .then(response => response.json())
              .then(data => {
                if (data.isProcessingDone) {
                  window.location.href = '/doneProcessing';
                }
              });
          }, 1000);
        </script>
      </head>
      <body>
        <p>Processing data, please wait...</p>
      </body>
    </html>
  `);
});

router.get("/processTermStatistics", async function (req, res, next) {
  if (!isProcessing) {
    isProcessing = true;
    isProcessingDone = false;

    train.processTermStatistics().then(() => {
      isProcessing = false;
      isProcessingDone = true;
    });
  }

  res.send(`
    <html>
      <head>
        <script>
          setInterval(function() {
            fetch('/checkProcessingStatus')
              .then(response => response.json())
              .then(data => {
                if (data.isProcessingDone) {
                  window.location.href = '/doneProcessing';
                }
              });
          }, 1000);
        </script>
      </head>
      <body>
        <p>Processing data, please wait...</p>
      </body>
    </html>
  `);
});

/**
 * @swagger
 * /checkProcessingStatus:
 *   get:
 *     summary: Check processing status
 *     responses:
 *       200:
 *         description: Processing status
 */
router.get('/checkProcessingStatus', function (req, res, next) {
  res.json({ isProcessingDone });
});

/**
 * @swagger
 * /doneProcessing:
 *   get:
 *     summary: Processing done
 *     responses:
 *       200:
 *         description: Processing complete
 */
router.get('/doneProcessing', function (req, res, next) {
  res.send('Processing is complete! <a href="/">Go back</a>');
});

module.exports = router;
