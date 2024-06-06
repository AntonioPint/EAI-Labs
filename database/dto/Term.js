// term.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const bagOfWrds = require('../../classification/bagOfWords.js');
const os = require('os');
const bagOfWords = require('../../classification/bagOfWords.js');


class Term {
    constructor(name, binary, occurrences, tf, idf, tfidf, docId, wordCount, classification) {
        this.name = name;
        this.binary = binary;
        this.occurrences = occurrences;
        this.tf = tf;
        this.idf = idf;
        this.tfidf = tfidf;
        this.docId = docId;
        this.wordCount = wordCount;
        this.classification = classification;
    }

    static async createTermData(bagOfWords, documents, classification, docIds) {
        
        const numThreads = os.cpus().length ; console.log(`nThreads:${numThreads}`) // Number of worker threads to use
        const chunkSize = Math.ceil(bagOfWords.length / numThreads);
        const promises = [];

        for (let i = 0; i < numThreads; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, bagOfWords.length);
            const workerBagOfWords = bagOfWords.slice(start, end);

            promises.push(new Promise((resolve, reject) => {
                const worker = new Worker(__filename, {
                    workerData: { workerBagOfWords, documents, classification, docIds }
                });

                worker.on('message', resolve);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            }));
        }

        return Promise.all(promises).then(results => [].concat(...results));
    }
}

if (!isMainThread) {
    // Worker thread code
    const { workerBagOfWords, documents, classification, docIds } = workerData;

    const termData = [];

    const idfVector = bagOfWrds.idfVector(workerBagOfWords, documents);

    // for (let i = 0; i < workerBagOfWords.length; i++) {
    //     const word = workerBagOfWords[i];
    //     console.log(word)
    //     for (let j = 0; j < documents.length; j++) {
    //         const tfVector = bagOfWrds.tfVector(workerBagOfWords, documents[j]);
    //         const tfidfVector = bagOfWrds.tfidfVector(tfVector, idfVector);
    //         const binaryVector = bagOfWrds.binaryVector(workerBagOfWords, documents[j]);
    //         const occurrencesVector = bagOfWrds.numberOfOccurrencesVector(workerBagOfWords, documents[j]);

    //         termData.push(new Term(word, binaryVector[i], occurrencesVector[i], tfVector[i], idfVector[i], tfidfVector[i], docIds[j], word.split(" ").length, classification));
    //     }
    // }

    for( let i = 0; i < documents.length; i++){
        const tfVector = bagOfWrds.tfVector(workerBagOfWords, documents[i]);
        const tfidfVector = bagOfWrds.tfidfVector(tfVector, idfVector);
        const binaryVector = bagOfWrds.binaryVector(workerBagOfWords, documents[i]);
        const occurrencesVector = bagOfWrds.numberOfOccurrencesVector(workerBagOfWords, documents[i]);

        for(let j = 0; j < workerBagOfWords.length; j++){
            const word = workerBagOfWords[j];

            termData.push(new Term(word, binaryVector[j], occurrencesVector[j], tfVector[j], idfVector[j], tfidfVector[j], docIds[i], word.split(" ").length, classification ))
        }
    }

    parentPort.postMessage(termData);
}

module.exports = Term;
