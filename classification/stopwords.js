
const sw = require('stopword')

function removeGeneralStopwords(inputText){
    return sw.removeStopwords(inputText.split(" ")).filter(e=> e != "").join(" ")
}

function removeCustomStopwords(inputText, stringsToRemove){
    const regexPattern = new RegExp(stringsToRemove.join("|"), "gi");
    return removeGeneralStopwords(inputText.replace(regexPattern, ""));
}

module.exports.removeGeneralStopwords = removeGeneralStopwords
module.exports.removeCustomStopwords = removeCustomStopwords