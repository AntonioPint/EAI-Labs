const connection = require("../config");

function getTrainingSet() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
                            fr.FullReview as review_text,
                            tas.class,
                            fr.id
                        FROM 
                            food_review fr 
                        INNER JOIN 
                            training_set tas 
                        ON 
                            fr.id = tas.review_id;
    `, function (err, rows, fields) {
            if (err) {
                reject(err);
                // connection.destroy()
                return;
            }
            resolve(rows);
        });
    });
}

function getTestingSet() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
                            fr.FullReview as review_text,
                            tes.class,
                            fr.id
                        FROM 
                            food_review fr 
                        INNER JOIN 
                            testing_set tes 
                        ON 
                            fr.id = tes.review_id;
    `, function (err, rows, fields) {
            if (err) {
                reject(err);
                // connection.destroy()
                return;
            }
            resolve(rows);
        });
    });
}


module.exports = {
    getTrainingSet: getTrainingSet,
    getTestingSet: getTestingSet
}