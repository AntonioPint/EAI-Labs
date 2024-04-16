const HotelReview = require("../database/dto/hotelReview.js")
const connection = require("../database/config.js");
const preprocessing = require("./preprocessing.js")
const counting = require("./counting.js")
const bgOfWrds = require("./bagOfWords.js")
const fs = require('node:fs');
const Term = require("../classes/Term.js")

async function process() {
    let training_set = await getTrainingSet();

    training_set.sort((a, b) => { return b.class - a.class })

    let preprocessedTraining = training_set.map(element => {
        let preProcessed = preprocessing(element.review_text, [1, 2])
        return { class: element.class, ...preProcessed }
    });

    // let preprocessedTraining = [
    //     { class: 1, ...preprocessing("This dog wants to play. This person wants to play", [1, 2]) },
    //     { class: 1, ...preprocessing("The computer runs fast. The person runs fast", [1, 2]) }
    // ]
    let unigramPositives = []
    let unigramNegatives = []
    let bigramPositives = []
    let bigramNegatives = []

    // TK
    preprocessedTraining.forEach(element => {
        let result = []
        element.tokens.forEach(tokensNgram => {
            let tokensResult = []
            tokensNgram.forEach(token => {
                tokensResult.push(counting.tf(tokensNgram, token))
            })
            result.push(tokensResult)
        })
        element.tf = result
    });

    preprocessedTraining = preprocessedTraining.slice(0,2)
    // console.log(preprocessedTraining)
    // positives e negatives
    preprocessedTraining.forEach(element => {
        let unigram = element.tokens[0]
        let bigram = element.tokens[1]

        if (element.class == 0) {
            unigramNegatives = bgOfWrds.addUniqueTerms(unigramNegatives, unigram)
            bigramNegatives = bgOfWrds.addUniqueTerms(bigramNegatives, bigram)
        } else if (element.class == 1) {
            unigramPositives = bgOfWrds.addUniqueTerms(unigramPositives, unigram)
            bigramPositives = bgOfWrds.addUniqueTerms(bigramPositives, bigram)
        }
    })

    let documents = preprocessedTraining.map((e)=> e.tokens[0])

    // const bagOfWords = ["room", "small", "messy", "breakfast", "very", "good", "few", "choices"];
    // const documents = [
    //     ["room", "small", "messy"],
    //     ["breakfast", "very", "good"],
    //     ["breakfast", "very", "few", "choices"],
    // ];
    // const terms = documents[1] 
    console.log(documents)
    console.log(unigramPositives)
    let results = Term.createTermData(unigramPositives, documents)

    const content = JSON.stringify(results);
    fs.writeFile('./classification/preprocessing_tf.json', content, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
            console.log("Done Writting")
        }
    });

}

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
    getTrainingSet: getTrainingSet
}


process()