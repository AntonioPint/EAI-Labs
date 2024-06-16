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

function binaryVector(bagOfWords, document) {
    return bagOfWords.map((val) => {
        return counting.exists(document, val)
    })
}

function numberOfOccurrencesVector(bagOfWords, document) {
    return bagOfWords.map((val) => {
        return counting.numberOfOccurrences(val, document)
    })
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

    const numDocuments = documents.length;
    let numDocumentsWithTerm = new Array(bagOfWords.length).fill(0);
    for (let i = 0; i < documents.length; i++) {
        const occurrencesVec = binaryVector(bagOfWords, documents[i]);
        numDocumentsWithTerm = sumArrays(numDocumentsWithTerm, occurrencesVec)
    }

    return bagOfWords.map((e, index) => {
        return counting.idf(numDocuments, numDocumentsWithTerm[index])
    })
}

function sumArrays(arr1, arr2) {
    // Check if both arrays have the same length
    if (arr1.length !== arr2.length) {
        throw new Error("Arrays must have the same length");
    }

    // Initialize an array to store the sum of arrays
    let result = [];

    // Iterate through each element of the arrays
    for (let i = 0; i < arr1.length; i++) {
        // Add corresponding elements and push the result to the result array
        result.push(arr1[i] + arr2[i]);
    }

    // Return the resulting array
    return result;
}

function tfidfVector(tfVector, idfVector) {

    return tfVector.map((value, index) => value * idfVector[index]);
}

function sumVector(termsArray) {
    if (termsArray.length === 0) {
        return null; // ou [] se preferir retornar um array vazio
    }

    termsArray = removeOutliersByMinOccurrences(termsArray, 3)

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
    return Array.from(termGroups.values())

}

function avgVector(termsArray) {

    if (termsArray.length === 0) {
        return null;
    }

    termsArray = removeOutliersByMinOccurrences(termsArray, 3)

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

    return avgVectors
}

function removeOutliersByMinOccurrences(termsArray, minOccurrences = 3) {

    return termsArray.filter(e => {return  e.occurrences >= minOccurrences});
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
