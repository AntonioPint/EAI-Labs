const counting = require("./counting.js")
const preprocessing = require("./preprocessing.js")
const termRepository = require("../database/repositories/termRepository.js");
const termStatisticRepository = require("../database/repositories/termStatisticRepository.js");

async function cossineSimilarityResult(text) {
    let preProcessed = preprocessing(text, [1, 2])
    console.log(preProcessed)
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
Spicy sweetness! I''ve always been drawn to K-Cup varieties with out there names (Jet Fuel, Black Tiger) and distinctive flavors (Golden French Toast, Spicy Mayan Chocolate). This offering melds those two features into something I''m happy to wake up to!<br /><br />To me, Jamaica Me Crazy''s definitely got a pervasive coconut taste fairly similar to Dunkin'' Donuts coconut flavored coffee, but it''s also got a lot of the flavor characteristics I''ve come to expect from K-Cup chocolate brews. Barely any of that acidic aftertaste that''s almost inevitable with artificial flavors, and definitely not as watery as many other K-cup varieties. Sure, the name''s pretty corny and the taste is hardly subtle or sophisticated, but that''s what makes this cup of joe so fun!
`)