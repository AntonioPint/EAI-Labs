const bagOfWords = require("./bagOfWords.js");

function selectKBest(termsArray, metric, useAverage = false, k=null) {
    let result = []
    if (termsArray == null || termsArray.length == 0){
        return result
    }
    if (k == null){
        k = Math.ceil(termsArray.length * .2)
    }
    console.log("asadasd")
    if (useAverage) {
        result = bagOfWords.avgVector(termsArray)
    } else {
        result = bagOfWords.sumVector(termsArray)
    }


    result.sort((a, b) => {
        let aValue, bValue;
        switch (metric) {
            case "binary":
                aValue = a.binary
                bValue = b.binary
                break;
            case "occurences":
                aValue = a.occurences
                bValue = b.occurences
                break;
            case "tf":
                aValue = a.tf
                bValue = b.tf
                break;
            case "tfIdf":
                aValue = a.tfIdf
                bValue = b.tfIdf
                break;
            default:
                throw new Error("Métrica Inválida")
        }
        // Sort in descending order
        return bValue - aValue;
    })
    // result = result.filter(e => {return e.docIds.length >= minOccurences})
    // Return the top K terms
    return result.slice(0, k);
}

module.exports = {
    selectKBest: selectKBest
}