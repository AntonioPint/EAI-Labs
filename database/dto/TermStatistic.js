module.exports = class TermStatistic {
    constructor(name, binary, occurrences, tf, tfidf, docIds, count, classification) {
        this.name = name;
        this.binary = binary;
        this.occurrences = occurrences;
        this.tf = tf;
        this.tfidf = tfidf;
        this.docIds = docIds;
        this.classification = classification;
    }
}