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

const csv = require('csv-parser');

async function processTerms() {
    let training_set = await getTrainingSet();

    training_set.sort((a, b) => { return b.class - a.class })

    let preprocessedTraining = training_set.map(element => {
        let preProcessed = preprocessing(element.review_text, [1, 2])
        return { class: element.class, ...preProcessed, docId: element.id }
    });

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
    preprocessedTraining = preprocessedTraining.slice(775, 825)

    //Essencial para conter apenas tokens quando arrayLength > 0
    preprocessedTraining = preprocessedTraining.filter(e => {
        return (e.tokens[0].length > 0 && e.tokens[1].length > 0)
    })

    // positives and negatives
    let semiDatasets = {
        documentsUnigram: { data: [], docIds: [] },
        documentsBigram: { data: [], docIds: [] },
        unigramPositives: [],
        unigramNegatives: [],
        bigramPositives: [],
        bigramNegatives: [],
    }

    preprocessedTraining.forEach(element => {
        let unigram = element.tokens[0]
        let bigram = element.tokens[1]

        if (element.class == 0) {
            semiDatasets.unigramNegatives = bgOfWrds.addUniqueTerms(semiDatasets.unigramNegatives, unigram)
            semiDatasets.bigramNegatives = bgOfWrds.addUniqueTerms(semiDatasets.bigramNegatives, bigram)

        } else if (element.class == 1) {
            semiDatasets.unigramPositives = bgOfWrds.addUniqueTerms(semiDatasets.unigramPositives, unigram)
            semiDatasets.bigramPositives = bgOfWrds.addUniqueTerms(semiDatasets.bigramPositives, bigram)
        }

        semiDatasets.documentsUnigram.docIds.push(element.docId)
        semiDatasets.documentsBigram.docIds.push(element.docId)

        semiDatasets.documentsUnigram.data.push(element.tokens[0])
        semiDatasets.documentsBigram.data.push(element.tokens[1])
    })

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
    termDataPromises.push(Term.createTermData(semiDatasets.unigramPositives, semiDatasets.documentsUnigram.data, 1, semiDatasets.documentsUnigram.docIds));
    termDataPromises.push(Term.createTermData(semiDatasets.unigramNegatives, semiDatasets.documentsUnigram.data, 0, semiDatasets.documentsUnigram.docIds));

    termDataPromises.push(Term.createTermData(semiDatasets.bigramPositives, semiDatasets.documentsBigram.data, 1, semiDatasets.documentsBigram.docIds));
    termDataPromises.push(Term.createTermData(semiDatasets.bigramNegatives, semiDatasets.documentsBigram.data, 0, semiDatasets.documentsBigram.docIds));

    // Wait for all promises to resolve
    const resolvedResults = await Promise.all(termDataPromises.map(async (promise) => await promise));
    console.log("INSERTING  TERMS");
    for (const results of resolvedResults) {
        for (const e of results) {
            await termRepository.insertTerm(e);
        }
    }
    console.log("FINISHED GENERATING TERM");

    // const content = JSON.stringify(resolvedResults);
    // fs.writeFile('./classification/preprocessing_tf2.json', content, err => {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         // file written successfully
    //         console.log("Done Writting")
    //     }
    // });
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

