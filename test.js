

function numberOfOccurrencesVector(bagOfWords, documents) {
    const occurrencesVec = [];
    for (const word of bagOfWords) {
        let occurrences = 0;
        for (const document of documents) {
            if (document == word) {
                occurrences++;
            }
        }
        occurrencesVec.push(occurrences);
    }
    return occurrencesVec;
}

bagOfWords= [
    "tobr",
    "br",
    "jamaica",
    "crazi",
    "definit",
    "pervas",
    "coconut",
    "fairli",
    "similar",
    "dunkin",
    "donut",
    "it",
    "lot",
    "characterist",
    "expect",
    "brew",
    "bare",
    "acid",
    "aftertast",
    "that",
    "almost",
    "inevit",
  ]
documents = [
    "br",
    "lavazza",
    "decaf",
    "espresso",
    "ground",
    "coffe",
    "iv",
    "us",
    "coffe",
    "sever",
    "year",
    "quit",
    "satisfi",
    "decaf",
    "rich",
    "satisfi",
    "robust",
    "tast",
    "earli",
    "morn",
    "on",
    "best",
    "decaf",
    "coffe",
    "iv",
    "tast",
  ]


console.log(numberOfOccurrencesVector(bagOfWords,documents))