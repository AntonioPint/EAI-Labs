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
	return numberOfOccurrencesVector(bagOfWords,documents).map((val)=>{
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

const bagOfWords = ["room", "small", "messy", "breakfast", "very", "good", "few", "choices"];
const documents = [
	["room", "small", "messy"],
	["breakfast", "very", "good"],
	["breakfast", "very", "few", "choices"],
];
const terms = documents[0]


// const tfidfVector2 = tfidfVector(bagOfWords, documents, terms);
// console.log("tfidfVector:");
// console.log(tfidfVector2);

// const idfVec = idfVector(bagOfWords, documents, terms);
// console.log("IDF Vector:");
// console.log(idfVec);
 
module.exports = {
	addUniqueTerms: addUniqueTerms,
	binaryVector: binaryVector,
	numberOfOccurrencesVector: numberOfOccurrencesVector,
	tfVector: tfVector,
	idfVector: idfVector,
	tfidfVector: tfidfVector
};
