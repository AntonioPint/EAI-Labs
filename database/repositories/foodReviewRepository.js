const FoodReview = require("../dto/foodReview.js")
const connection = require("../config.js");


function getPositiveReviews(x=1000) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT FullReview FROM food_review WHERE Score > 3 order by Score desc limit ? ;", [x] , function (err, rows, fields) {
            if (err) {
                reject(err); 
                // connection.destroy()
                return;
            }
            let result = rows.map(e => e.FullReview)
            resolve(result); 
        });
    });
}

function getNegativeReviews(x=1000) {
        return new Promise((resolve, reject) => {
            connection.query("SELECT FullReview FROM food_review WHERE Score < 3 order by Score desc limit ? ;", [x] , function (err, rows, fields) {
                if (err) {
                    reject(err); 
                    // connection.destroy()
                    return;
                }
                let result = rows.map(e => e.FullReview)
                resolve(result); 
            });
        });
    }

function getReview(id) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM food_review where id = ? ;", [id] , function (err, rows, fields) {
            if (err) {
                reject(err); 
                // connection.destroy()
                return;
            }

            let result = rows.map(e => new FoodReview(e))[0]
            resolve(result); 
        });
    });
}

module.exports = {
  getPositiveReviews: getPositiveReviews,
  getNegativeReviews: getNegativeReviews,
  getReview: getReview
};
