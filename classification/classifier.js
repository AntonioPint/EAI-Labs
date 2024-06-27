const counting = require("./counting.js");
const preprocessing = require("./preprocessing.js");
const termRepository = require("../database/repositories/termRepository.js");
const termStatisticRepository = require("../database/repositories/termStatisticRepository.js");
const bayes = require("./bayes.js");


// Default initialization of cache
const cache = {
    termsOriginalNegative: null,
    termsOriginalPositive: null,
    termsStatistics: null,
    populated: false
};

async function cossineSimilarityResult(text) {
    let preProcessed = preprocessing(text, [1, 2]);

    preProcessed.tf = preProcessed.tokens.map(tokensNgram =>
        tokensNgram.map(token => counting.tf(tokensNgram, token))
    );
    preProcessed.tokens = [].concat(...preProcessed.tokens);
    preProcessed.tf = [].concat(...preProcessed.tf);
    preProcessed.tfidfPositive = [];
    preProcessed.tfidfNegative = [];

    if (!cache.populated) {
        [cache.termsOriginalNegative, cache.termsOriginalPositive, cache.termsStatistics] = await Promise.all([
            termRepository.getIdfOfTerms(0),
            termRepository.getIdfOfTerms(1),
            termStatisticRepository.getTermStatisticsFormated()
        ]);

        for (let termStatistic of cache.termsStatistics) {
            termStatistic.bagOfWords = JSON.parse(termStatistic.bagOfWords);
        }

        cache.populated = true;
    }

    let termPositivesList = cache.termsStatistics.find(term => term.label === 1)?.bagOfWords || [];
    let termNegativesList = cache.termsStatistics.find(term => term.label === 0)?.bagOfWords || [];

    const termPositives = new Map(termPositivesList.map(e => [e.name, { tf: e.tf, tfidf: e.tfidf, classification: e.classification }]));
    const termNegatives = new Map(termNegativesList.map(e => [e.name, { tf: e.tf, tfidf: e.tfidf, classification: e.classification }]));

    for (let i = 0; i < preProcessed.tokens.length; i++) {
        let wordIdfPositive = cache.termsOriginalPositive.get(preProcessed.tokens[i])?.idf || 0;
        let wordIdfNegative = cache.termsOriginalNegative.get(preProcessed.tokens[i])?.idf || 0;

        preProcessed.tfidfPositive.push(
            counting.tfidf(
                preProcessed.tf[i] || 0,
                wordIdfPositive
            )
        );
        preProcessed.tfidfNegative.push(
            counting.tfidf(
                preProcessed.tf[i] || 0,
                wordIdfNegative
            )
        );
    }

    let originalTfidfPositive = preProcessed.tokens.map(e => { return termPositives.get(e)?.tfidf || 0 });
    let originalTfidfNegative = preProcessed.tokens.map(e => { return termNegatives.get(e)?.tfidf || 0 });

    let similarityCossenPositive = cosineSimilarity(preProcessed.tfidfPositive, originalTfidfPositive);
    let similarityCossenNegative = cosineSimilarity(preProcessed.tfidfNegative, originalTfidfNegative);

    let decision = +(similarityCossenPositive > similarityCossenNegative);

    return {
        decision: decision,
        similarityCossenPositiveNegative: [similarityCossenPositive, similarityCossenNegative]
    };
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
    if ((magnitude1 * magnitude2) == 0) return 0;
    let similarity = dotProduct / (magnitude1 * magnitude2);

    return similarity;
}



async function probabilisticClassification(texto) {


    const PositiveApriori = await bayes.classProbability(1)
    const NegativeApriori = await bayes.classProbability(0)

    // get words from texto and clean, until tokens
    let preProcessed = preprocessing(texto, [1, 2])
    preProcessed.tokens = [].concat(...preProcessed.tokens)
    preProcessed.bayesPositive = []
    preProcessed.bayesNegative = []

    // obter soma das classes 
    const tfIdfClassSums = await termStatisticRepository.getTermStatisticTfidfSum()
    const termsTfIdf = await termStatisticRepository.getTermStatisticTfidf(preProcessed.tokens)


    let finalValuePositive = 1;
    let finalValueNegative = 1;

    termsTfIdf.forEach(term => {
        if (term.positiveTfIdf != 0) {
            finalValuePositive *= ((term.positiveTfIdf) * tfIdfClassSums.get(1))
        }
        if (term.negativeTfIdf != 0) {
            finalValueNegative *= ((term.negativeTfIdf) * tfIdfClassSums.get(0))
        }
    });

    finalValuePositive *= PositiveApriori
    finalValueNegative *= NegativeApriori

    let decision = +(finalValuePositive > finalValueNegative);
    return {
        decision: decision,
        naiveBayes: [finalValuePositive, finalValueNegative]
    };

}


module.exports = {
    cossineSimilarityResult: cossineSimilarityResult,
    probabilisticClassification: probabilisticClassification
};
