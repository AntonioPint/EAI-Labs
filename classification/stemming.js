const natural = require('natural');
const stemmer = natural.PorterStemmer;

module.exports = (inputText) => {
    console.log(inputText)
    let strings = inputText.split(" ")
    strings = strings.map(element => stemmer.stem(element));
    return strings.join(" ");
}