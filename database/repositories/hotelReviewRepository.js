const HotelReview = require("../dto/hotelReview.js")
const connection = require("../config.js");

connection.connect();

function getPositiveReviews(x=1000) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT Positive_Review FROM hotel_review WHERE Reviewer_Score >= 8 order by Reviewer_Score desc limit ? ;", [x] , function (err, rows, fields) {
            if (err) {
                reject(err); 
                connection.destroy()
                return;
            }
            let result = rows.map(e => e.Positive_Review)
            resolve(result); 
        });
    });
}

function getNegativeReviews(x=1000) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT Negative_Review FROM hotel_review WHERE Reviewer_Score < 2 order by Reviewer_Score asc limit ? ;", [x] , function (err, rows, fields) {
            if (err) {
                reject(err); 
                connection.destroy()
                return;
            }
            let result = rows.map(e => e.Negative_Review)
            resolve(result); 
        });
    });
}

function getReview(id) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM hotel_review where id = ? ;", [id] , function (err, rows, fields) {
            if (err) {
                reject(err); 
                connection.destroy()
                return;
            }

            let result = rows.map(e => new HotelReview(e))[0]
            resolve(result); 
        });
    });
}

module.exports = {
  getPositiveReviews: getPositiveReviews,
  getNegativeReviews: getNegativeReviews,
  getReview: getReview
};
