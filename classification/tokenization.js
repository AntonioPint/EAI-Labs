const natural = require('natural');
const nGram = natural.NGrams;

function concatenatePairs(arrayOfArrays) {
    return arrayOfArrays.map(innerArray => innerArray.join(' '));
}

module.exports = (text, n) => { return concatenatePairs(nGram.ngrams(text, n)) };
