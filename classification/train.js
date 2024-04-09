const HotelReview = require("../database/dto/hotelReview.js")
const connection = require("../database/config.js");
let preprocessing = require("./preprocessing.js")
let counting = require("./counting.js")
const fs = require('node:fs');

async function process() {
    let training_set = await getTrainingSet();

    training_set.sort((a, b) => { return b.class - a.class })

    let preprocessedTraining = training_set.map(element => {
        return preprocessing(element.review_text, [1, 2])
    });

    preprocessedTraining = [preprocessing("This dog wants to play. This person wants to play", [1, 2])]

    preprocessedTraining.forEach(element => {
        let result = []
        element.tokens.forEach(tokensNgram =>{
            let tokensResult = []
            tokensNgram.forEach(token =>{
                tokensResult.push(counting.tf(tokensNgram, token))
            })
            result.push(tokensResult)
        })
        element.tf = result
    });

    const content = JSON.stringify(preprocessedTraining);
    fs.writeFile('./classification/preprocessing_tf.json', content, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });

}

function getTrainingSet() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
                            CASE 
                                WHEN ts.class = 0 THEN hr.Negative_Review 
                                WHEN ts.class = 1 THEN hr.Positive_Review 
                            END AS review_text,
                            ts.class,
                            hr.id
                        FROM 
                            hotel_review hr 
                        INNER JOIN 
                            training_set ts 
                        ON 
                            hr.id = ts.review_id;
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
    getTrainingSet: getTrainingSet
}


process()