var tokenization = require("./tokenization.js")

function countByNgrams(text, n) {
    return tokenization(text, n).length
}

function countBySize(tokens) {
    return tokens.length
}

function numberOfOccurrences(tokens, token) {
    let count = 0;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].length === token.length) {
            let match = true;
            for (let j = 0; j < tokens[i].length; j++) {
                if (tokens[i][j] !== token[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                count++;
            }
        }
    }
    return count;
}


function exists(tokens, token){
    return numberOfOccurrences(tokens, token) > 0;
}

function tf(tokens, token){
    console.log("//")
    console.log(numberOfOccurrences(tokens, token))
    console.log(countBySize(tokens))
    console.log(tokens)
    console.log(token)
    console.log("//")
    return numberOfOccurrences(tokens, token) / countBySize(tokens)
}

function idf(N, d){
    return Math.log10(N/d)
}

function tfidf(tf, idf){
    return tf * idf
}

module.exports = {
    countByNgrams: countByNgrams,
    countBySize: countBySize,
    exists: exists,
    tf: tf,
    idf: idf,
    tfidf: tfidf
}
