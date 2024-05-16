const connection = require("../config");

function getTrainingSet() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
                            CASE 
                                WHEN tas.class = 0 THEN hr.Negative_Review 
                                WHEN tas.class = 1 THEN hr.Positive_Review 
                            END AS review_text,
                            tas.class,
                            hr.id
                        FROM 
                            hotel_review hr 
                        INNER JOIN 
                            training_set tas 
                        ON 
                            hr.id = tas.review_id;
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
                            CASE 
                                WHEN tes.class = 0 THEN hr.Negative_Review 
                                WHEN tes.class = 1 THEN hr.Positive_Review 
                            END AS review_text,
                            tes.class,
                            hr.id
                        FROM 
                            hotel_review hr 
                        INNER JOIN 
                            testing_set tes 
                        ON 
                            hr.id = tes.review_id;
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