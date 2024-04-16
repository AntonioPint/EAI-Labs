var tokenization = require("./tokenization.js")

function countByNgrams(text, n) {
    return tokenization(text, n).length
}

function countBySize(document) {
    return document.length
}

function numberOfOccurrences(word, document) {
    return document.reduce((count, documentWord) => {
        return count + (word === documentWord ? 1 : 0);
    }, 0);
}

function exists(document, word) {
    return numberOfOccurrences(word, document) > 0;
}

function tf(document, word) {
    return numberOfOccurrences(word, document) / countBySize(document)
}

function idf(N, d) {
    return Math.log10(N / d)
}

function tfidf(tf, idf) {
    return tf * idf
}

module.exports = {
    numberOfOccurrences: numberOfOccurrences,
    countByNgrams: countByNgrams,
    countBySize: countBySize,
    exists: exists,
    tfidf: tfidf,
    idf: idf,
    tf: tf,
}
