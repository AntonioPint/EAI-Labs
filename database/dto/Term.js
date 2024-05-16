let bagOfWrds = require("../../classification/bagOfWords.js")
const counting = require("../../classification/counting.js")
class Term {
    constructor(name, binary, occurrences, tf, idf, tfidf, docId, wordCount, classification) {
        this.name = name;
        this.binary = binary;
        this.occurrences = occurrences;
        this.tf = tf;
        this.idf = idf;
        this.tfidf = tfidf;
        this.docId = docId;
        this.wordCount = wordCount
        this.classification = classification;
    }

    static createTermData(bagOfWords, documents, classification) {
        const termData = [];

        for (let i = 0; i < bagOfWords.length; i++) {
            const word = bagOfWords[i]
            const idfVector = bagOfWrds.idfVector(bagOfWords, documents)
            if (i % 100 == 0) console.log([word, classification])

            for (let j = 0; j < documents.length; j++) {
                let tfVector = bagOfWrds.tfVector(bagOfWords, documents[j])
                let tfidfVector = bagOfWrds.tfidfVector(tfVector, idfVector)

                const binaryVector = bagOfWrds.binaryVector(bagOfWords, documents[j])
                const occurrencesVector = bagOfWrds.numberOfOccurrencesVector(bagOfWords, documents[j])

                termData.push(new Term(word, binaryVector[i], occurrencesVector[i], tfVector[i], idfVector[i], tfidfVector[i], j, word.split(" ").length, classification))
            }
        }
        return termData
    }
}


module.exports = Term