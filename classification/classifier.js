const counting = require("./counting.js")
const preprocessing = require("./preprocessing.js")

function cossineSimilarity(text){
    let preProcessed = preprocessing(text, [1, 2])

    preProcessed.tf = preProcessed.tokens.map(tokensNgram => 
        tokensNgram.map(token => counting.tf(tokensNgram, token))
    );
    
    console.log(preProcessed)
}

cossineSimilarity("Wonderful, tasty taffy This taffy is so good. ")