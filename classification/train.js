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
const classifier = require("./classifier.js")


async function processTerms() {
    let training_set = await getTrainingSet();

    training_set.sort((a, b) => { return b.class - a.class })

    let preprocessedTraining = training_set.map(element => {
        let preProcessed = preprocessing(element.review_text, [1, 2])

        preProcessed.tf = preProcessed.tokens.map(tokensNgram =>
            tokensNgram.map(token => counting.tf(tokensNgram, token))
        );

        return { class: element.class, ...preProcessed, docId: element.id }
    });


    //Essencial para conter apenas tokens quando arrayLength > 0
    preprocessedTraining = preprocessedTraining.filter(e => {
        return (e.tokens[0].length > 0 && e.tokens[1].length > 0)
    })

    // positives and negatives
    let semiDatasets = {
        documentsUnigram: { positives: { data: [], docIds: [] }, negatives: { data: [], docIds: [] } },
        documentsBigram: { positives: { data: [], docIds: [] }, negatives: { data: [], docIds: [] } },
        unigramPositives: [],
        unigramNegatives: [],
        bigramPositives: [],
        bigramNegatives: [],
    }

    await preprocessedTraining.forEach(async element => {
        let unigram = element.tokens[0]
        let bigram = element.tokens[1]

        if (element.class == 0) {
            semiDatasets.unigramNegatives = bgOfWrds.addUniqueTerms(semiDatasets.unigramNegatives, unigram)
            semiDatasets.bigramNegatives = bgOfWrds.addUniqueTerms(semiDatasets.bigramNegatives, bigram)

            semiDatasets.documentsUnigram.negatives.docIds.push(element.docId)
            semiDatasets.documentsBigram.negatives.docIds.push(element.docId)
            semiDatasets.documentsUnigram.negatives.data.push(element.tokens[0])
            semiDatasets.documentsBigram.negatives.data.push(element.tokens[1])

        } else if (element.class == 1) {
            semiDatasets.unigramPositives = bgOfWrds.addUniqueTerms(semiDatasets.unigramPositives, unigram)
            semiDatasets.bigramPositives = bgOfWrds.addUniqueTerms(semiDatasets.bigramPositives, bigram)

            semiDatasets.documentsUnigram.positives.docIds.push(element.docId)
            semiDatasets.documentsBigram.positives.docIds.push(element.docId)
            semiDatasets.documentsUnigram.positives.data.push(element.tokens[0])
            semiDatasets.documentsBigram.positives.data.push(element.tokens[1])
        }

    })

    // const bagOfWords = ["room", "small", "messy", "breakfast", "very", "good", "few", "choices"];
    // const documents = [
    //     ["room", "small", "messy"],
    //     ["breakfast", "very", "good"],
    //     ["breakfast", "very", "few", "choices"],
    // ];

    // console.log("GENERATING TERM"); await termRepository.truncateTable()

    async function insertTermData(termData){
        console.log("INSERTING TERM_DATA");
        for (const e of termData) {
            if (e.binary) await termRepository.insertTerm(e);
        }
    } 

    // Push arrays of term data for unigram positives, unigram negatives, bigram positives, and bigram negatives
    let termData = await Term.createTermData(semiDatasets.unigramPositives, semiDatasets.documentsUnigram.positives.data, 1, semiDatasets.documentsUnigram.positives.docIds);
    await insertTermData(termData)
    termData = await Term.createTermData(semiDatasets.unigramNegatives, semiDatasets.documentsUnigram.negatives.data, 0, semiDatasets.documentsUnigram.negatives.docIds);
    await insertTermData(termData)
    // termData = await Term.createTermData(semiDatasets.bigramPositives, semiDatasets.documentsBigram.positives.data, 1, semiDatasets.documentsBigram.positives.docIds);
    // await insertTermData(termData)
    // termData = await Term.createTermData(semiDatasets.bigramNegatives, semiDatasets.documentsBigram.negatives.data, 0, semiDatasets.documentsBigram.negatives.docIds);
    // await insertTermData(termData)
    delete termData;

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
    let resolvedResults = [
        await termRepository.getAllTermsWithFilters(0, 1), //1 word class 0
        await termRepository.getAllTermsWithFilters(0, 2),
        await termRepository.getAllTermsWithFilters(1, 1),
        await termRepository.getAllTermsWithFilters(1, 2)
    ]

    console.log("GENERATING TERM STATISTIC"); await termStatisticRepository.truncateTable()

    console.log("INSERTING  TERMS STATISTICS");
    for (const terms of resolvedResults) {
        let results = featureSelection.selectKBest(terms, "tfIdf", true)
        for(const result of results){
            await termStatisticRepository.insertTermStatistic(result)
        }
    }
    console.log("FINISHED GENERATING TERM STATISTIC");
}


module.exports = {
    getTrainingSet: getTrainingSet,
    processTerms: processTerms,
    processTermStatistics: processTermStatistics
}

