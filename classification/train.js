const HotelReview = require("../database/dto/hotelReview.js")
const connection = require("../database/config.js");
const preprocessing = require("./preprocessing.js")
const counting = require("./counting.js")
const bgOfWrds = require("./bagOfWords.js")
const fs = require('node:fs');
const Term = require("../database/dto/Term.js")
const featureSelection = require("./featureSelection.js");
const termStatisticRepository = require("../database/repositories/termStatisticRepository.js")
const termRepository = require("../database/repositories/termRepository.js");
const { getTrainingSet } = require("../database/repositories/trainAndTestingSets.js");

async function processTerms() {
    let training_set = await getTrainingSet();

    training_set.sort((a, b) => { return b.class - a.class })

    let preprocessedTraining = training_set.map(element => {
        let preProcessed = preprocessing(element.review_text, [1, 2])
        return { class: element.class, ...preProcessed, docId: element.id}
    });

    let unigramPositives = []
    let unigramNegatives = []
    let bigramPositives = []
    let bigramNegatives = []

    const startTime = performance.now();

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
    preprocessedTraining = preprocessedTraining.slice(750, 850)

    //Essencial para conter apenas tokens quando arrayLength > 0
    preprocessedTraining = preprocessedTraining.filter(e => {
        return (e.tokens[0].length > 0 && e.tokens[1].length > 0)
    })

    const originalDuration = performance.now() - startTime;
    console.log("Original version duration:", originalDuration, "milliseconds");

    // positives and negatives
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
    let documentsUnigram = preprocessedTraining.map((e) => e.tokens[0])
    let documentsBigram = preprocessedTraining.map((e) => e.tokens[1])

    // const bagOfWords = ["room", "small", "messy", "breakfast", "very", "good", "few", "choices"];
    // const documents = [
    //     ["room", "small", "messy"],
    //     ["breakfast", "very", "good"],
    //     ["breakfast", "very", "few", "choices"],
    // ];

    console.log("GENERATING TERM"); await termRepository.truncateTable()

    // Define an array to store arrays of term data
    const termDataPromises = [];

    // Push arrays of term data for unigram positives, unigram negatives, bigram positives, and bigram negatives
    termDataPromises.push(Term.createTermData(unigramPositives, documentsUnigram, 1));
    termDataPromises.push(Term.createTermData(unigramNegatives, documentsUnigram, 0));

    termDataPromises.push(Term.createTermData(bigramPositives, documentsBigram, 1));
    termDataPromises.push(Term.createTermData(bigramNegatives, documentsBigram, 0));

    // Wait for all promises to resolve
    const resolvedResults = await Promise.all(termDataPromises.map(async (promise) => await promise));
    console.log("INSERTING  TERMS");
    for (const results of resolvedResults) {
        for (const e of results) {
            await termRepository.insertTerm(e);
        }
    }
    console.log("FINISHED GENERATING TERM");


    const content = JSON.stringify(resolvedResults);
    fs.writeFile('./classification/preprocessing_tf2.json', content, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
            console.log("Done Writting")
        }
    });
}


async function processTermStatistics() {
    let resolvedResults = await termRepository.getAllTerms()

    if (resolvedResults == null || resolvedResults.length <= 0) {
        return
    }

    console.log("GENERATING TERM STATISTIC"); await termStatisticRepository.truncateTable()

    let Kbest = featureSelection.selectKBest(resolvedResults, "tfIdf", true)

    console.log("INSERTING  TERMS STATISTICS");
    for (const results of Kbest) {
        await termStatisticRepository.insertTermStatistic(results)

    }
    console.log("FINISHED GENERATING TERM STATISTIC");
}


module.exports = {
    getTrainingSet: getTrainingSet,
    processTerms: processTerms,
    processTermStatistics: processTermStatistics
}
