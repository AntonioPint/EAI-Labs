let bagOfWrds = require("../classification/bagOfWords.js")
const counting = require("../classification/counting.js")
class Term {
    constructor(name, binary, occurrences, tf, idf, tfidf, docId) {
        this.name = name;
        this.binary = binary;
        this.occurrences = occurrences;
        this.tf = tf;
        this.idf = idf;
        this.tfidf = tfidf;
        this.docId = docId;
    }

    static createTermData(bagOfWords, documents) {
        const termData = [];

        for (let i = 0; i < bagOfWords.length; i++) {
            const word = bagOfWords[i]
            const idfVector = bagOfWrds.idfVector(bagOfWords, documents)


            for (let j = 0; j < documents.length; j++) {
                let tfVector = bagOfWrds.tfVector(bagOfWords, documents[j])
                let tfidfVector = bagOfWrds.tfidfVector(tfVector, idfVector)

                const binaryVector = bagOfWrds.binaryVector(bagOfWords, documents[j])
                const occurrencesVector = bagOfWrds.numberOfOccurrencesVector(bagOfWords, documents[j])

                termData.push(new Term(word, binaryVector[i], occurrencesVector[i], tfVector[i], idfVector[i], tfidfVector[i], j))
            }
        }
        return termData
    }
}


module.exports = Term