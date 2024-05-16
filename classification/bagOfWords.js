var counting = require("./counting.js")

function addUniqueTerms(array1, array2) {
    const set = new Set(array1);

    for (let item of array2) {
        if (!set.has(item)) {
            array1.push(item);
            set.add(item);
        }
    }

    return array1;
}

function binaryVector(bagOfWords, documents) {
    return numberOfOccurrencesVector(bagOfWords, documents).map((val) => {
        return +(val > 0)
    })
}

function numberOfOccurrencesVector(bagOfWords, documents) {
    const occurrencesVec = [];
    for (const word of bagOfWords) {
        let occurrences = 0;
        for (const document of documents) {
            if (document.includes(word)) {
                occurrences++;
            }
        }
        occurrencesVec.push(occurrences);
    }
    return occurrencesVec;
}

function tfVector(bagOfWords, terms) {

    const tfVec = [];
    for (const word of bagOfWords) {
        const tf = counting.tf(terms, word)
        tfVec.push(tf);
    }
    return tfVec;
}


function idfVector(bagOfWords, documents) {
    const idfVec = [];
    const numDocuments = documents.length;
    const occurrencesVec = numberOfOccurrencesVector(bagOfWords, documents);
    for (let i = 0; i < bagOfWords.length; i++) {
        const numDocumentsWithTerm = occurrencesVec[i];

        const idf = numDocumentsWithTerm != 0 ?
            counting.idf(numDocuments, numDocumentsWithTerm) : 0;
        idfVec.push(idf);
    }
    return idfVec;
}

function tfidfVector(tfVector, idfVector) {

    return tfVector.map((value, index) => value * idfVector[index]);
}

function sumVector(termsArray) {
    if (termsArray.length === 0) {
        return null; // ou [] se preferir retornar um array vazio
    }

    // Criar um mapa para agrupar os termos pelo nome
    const termGroups = new Map();

    // Iterar sobre os termos para agrupá-los pelo nome
    termsArray.forEach(term => {
        let storedTerm = termGroups.get(term.name)

        if (storedTerm == null) {
            if (term.binary) {
                termGroups.set(term.name, {
                    name: term.name,
                    binary: term.binary,
                    occurrences: term.occurrences,
                    tf: term.tf,
                    tfidf: term.tf * term.idf, // Calcular o tfidf aqui
                    docIds: [term.docId],
                    classification: term.classification,
                    count: 1
                })
            } else {
                termGroups.set(term.name, {
                    name: term.name,
                    binary: 0,
                    occurrences: 0,
                    tf: 0,
                    tfidf: 0, // Calcular o tfidf aqui
                    docIds: [],
                    classification: term.classification,
                    count: 1
                })
            }

        } else {
            storedTerm.count += 1

            if (term.binary) {
                storedTerm.binary += term.binary;
                storedTerm.occurrences += term.occurrences;
                storedTerm.tf += term.tf;
                storedTerm.tfidf += term.tf * term.idf; // Somar ao tfidf
                storedTerm.docIds.push(term.docId);
            }
        }

    })

    // Retornar os vetores de soma de cada grupo
    return removeOutliersByMinOccurrences(
        Array.from(termGroups.values())
    );

}

function avgVector(termsArray) {
    if (termsArray.length === 0) {
        return null; 
    }

    // Criar um mapa para agrupar os termos pelo nome
    const termGroups = new Map();

    // Iterar sobre os termos para agrupá-los pelo nome
    termsArray.forEach(term => {
        let storedTerm = termGroups.get(term.name)

        if (storedTerm == null) {
            if (term.binary) {
                termGroups.set(term.name, {
                    name: term.name,
                    binary: term.binary,
                    occurrences: term.occurrences,
                    tf: term.tf,
                    tfidf: term.tf * term.idf, // Calcular o tfidf aqui
                    docIds: [term.docId],
                    classification: term.classification,
                    count: 1
                })
            } else {
                termGroups.set(term.name, {
                    name: term.name,
                    binary: 0,
                    occurrences: 0,
                    tf: 0,
                    tfidf: 0, // Calcular o tfidf aqui
                    docIds: [],
                    classification: term.classification,
                    count: 1
                })
            }

        } else {
            storedTerm.count += 1

            if (term.binary) {
                storedTerm.binary += term.binary;
                storedTerm.occurrences += term.occurrences;
                storedTerm.tf += term.tf;
                storedTerm.tfidf += term.tf * term.idf; // Somar ao tfidf
                storedTerm.docIds.push(term.docId);
            }
        }

    })

    // Calcular as médias para cada grupo
    const avgVectors = Array.from(termGroups.values()).map(group => {
        return {
            name: group.name,
            binary: group.binary / group.count,
            occurrences: group.occurrences / group.count,
            tf: group.tf / group.count,
            tfidf: group.tfidf / group.count,
            docIds: group.docIds,
            classification: group.classification
        };
    });
    return removeOutliersByMinOccurrences(avgVectors,0);
}

function removeOutliersByMinOccurrences(vectors, minOccurrences = 2) {
    // Filter out vectors based on minimum occurrences
    return vectors.filter(vector => vector.occurrences >= minOccurrences);
}

module.exports = {
    addUniqueTerms: addUniqueTerms,
    binaryVector: binaryVector,
    numberOfOccurrencesVector: numberOfOccurrencesVector,
    tfVector: tfVector,
    idfVector: idfVector,
    tfidfVector: tfidfVector,
    sumVector: sumVector,
    avgVector: avgVector,
    removeOutliersByMinOccurrences: removeOutliersByMinOccurrences,
};
