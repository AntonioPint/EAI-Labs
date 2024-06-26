const natural = require('natural');
const stemmer = natural.PorterStemmer;

module.exports = (inputText) => {
    let strings = inputText.split(" ")
    strings = strings.map(element => stemmer.stem(element));
    return strings.join(" ");
}