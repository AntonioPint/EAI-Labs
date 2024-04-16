var stpw = require("./stopwords.js")
var stemmr = require("./stemming.js")
var ngram = require("./tokenization.js")
var clean = require("./clean.js")

module.exports = (inputText, numbers, stopWords = []) => {
	// 1
	let cleanText = clean(inputText);
	let removedStoppedWordsText = stpw.removeCustomStopwords(cleanText, stopWords);

	// 2
	let stemmedText = stemmr(removedStoppedWordsText);
	let ngrams = numbers.map(number => ngram(stemmedText, number));

	return { originalText: inputText, cleanedText: cleanText, preprocessedText: stemmedText, tokens: ngrams }
}