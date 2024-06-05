const counting = require("./counting.js")
const preprocessing = require("./preprocessing.js")
const termRepository = require("../database/repositories/termRepository.js");
const termStatisticRepository = require("../database/repositories/termStatisticRepository.js");

async function cossineSimilarityResult(text) {
    let preProcessed = preprocessing(text, [1, 2])

    preProcessed.tf = preProcessed.tokens.map(tokensNgram =>
        tokensNgram.map(token => counting.tf(tokensNgram, token))
    );
    preProcessed.tokens = [].concat(...preProcessed.tokens)
    preProcessed.tf = [].concat(...preProcessed.tf)
    preProcessed.tfidfPositive = []
    preProcessed.tfidfNegative = []

    let [termsOriginalNegative, termsOriginalPositive, termsStatistics] = await Promise.all([
        termRepository.getIdfOfTerms(0),
        termRepository.getIdfOfTerms(1),
        termStatisticRepository.getTermStatisticsFormated()
    ]);

    for(let termStatistic of termsStatistics){
        termStatistic.bagOfWords = JSON.parse(termStatistic.bagOfWords)
    }
    
    let termPositivesList = termsStatistics.find(term => term.label === 1)?.bagOfWords || [];

    let termNegativesList = termsStatistics.find(term => term.label === 0)?.bagOfWords || [];


    const termPositives = new Map(termPositivesList.map(e => [e.name, { tf: e.tf, tfidf: e.tfidf, classification: e.classification }]));
    const termNegatives = new Map(termNegativesList.map(e => [e.name, { tf: e.tf, tfidf: e.tfidf, classification: e.classification }]));

    for (let i = 0; i < preProcessed.tokens.length; i++) {
        let wordIdfPositive = termsOriginalPositive.get(preProcessed.tokens[i])?.idf || 0
        let wordIdfNegative = termsOriginalNegative.get(preProcessed.tokens[i])?.idf || 0

        preProcessed.tfidfPositive.push(
            counting.tfidf(
                preProcessed.tf[i] || 0,
                wordIdfPositive
            )
        )
        preProcessed.tfidfNegative.push(
            counting.tfidf(
                preProcessed.tf[i] || 0,
                wordIdfNegative
            )
        )
    }

    let originalTfidfPositive = preProcessed.tokens.map(e => { return termPositives.get(e)?.tfidf || 0 })
    let originalTfidfNegative = preProcessed.tokens.map(e => { return termNegatives.get(e)?.tfidf || 0 })

    let similarityCossenPositive = cosineSimilarity(preProcessed.tfidfPositive, originalTfidfPositive)
    let similarityCossenNegative = cosineSimilarity(preProcessed.tfidfNegative, originalTfidfNegative)

    console.log([similarityCossenPositive, similarityCossenNegative])
    let decision = (similarityCossenPositive > similarityCossenNegative) ? "Positive" : "Negative"

    console.log(preProcessed.preprocessedText)
    console.log(decision)

}

function cosineSimilarity(vector1, vector2) {
    // Ensure vectors have the same length
    if (vector1.length !== vector2.length) {
        throw new Error('Vectors must have the same length');
    }

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
    }

    // Calculate magnitudes
    let magnitude1 = 0;
    let magnitude2 = 0;
    for (let i = 0; i < vector1.length; i++) {
        magnitude1 += Math.pow(vector1[i], 2);
        magnitude2 += Math.pow(vector2[i], 2);
    }
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    // Calculate cosine similarity
    if ((magnitude1 * magnitude2) == 0) return 0
    let similarity = dotProduct / (magnitude1 * magnitude2);

    return similarity;
}

cossineSimilarityResult(`
YUMMY! I got this for my Mum who is not diabetic but needs to watch her sugar intake,
 and my father who simply chooses to limit unnecessary sugar intake - she's the one with the sweet tooth 
 - they both LOVED these toffees, you would never guess that they're sugar-free and it's so great that 
 you can eat them pretty much guilt free!  i was so impressed that i've ordered some for myself 
 (w dark chocolate) to take to the office so i'll eat them instead of snacking on sugary sweets.<br />These are just EXCELLENT!   
`)