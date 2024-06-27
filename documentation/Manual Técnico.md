# Manual Técnico - Classificador de Texto

Instituto Politécnico de Setúbal - ESTS

Metrado Engenharia Informática - Extração Automática de Informação

António Carlos Ferreira Pinto<br>
Diogo Costa<br>
Guilherme Malhado<br>

<div style="page-break-after: always;"></div>

# Motivo

O desenvolvimento deste projeto visa criação de um modelo de previsão através de machine learning de modo a classificar textos com recurso a texto já classificados (Aprendimento supervisionado). Pretende-se classificar textos entre duas classes, classe positiva e classe negativa.

## Ferramentas de programação

Para efetuar este trabalho foram utilizadas as linguagens Javascript para efetuar a criação tanto da parte do servidor que processa os dados como a parte que disponibiliza o front-en para retirar informações

# Dataset

O dataset é uma parte crucial no treino de dados para a construção de classificadores de Machine Learning. O dataset escolhido para o efeito de treino foi o foodReviews.csv. Este dataset consiste em 568 454 reviews de utilizadores. A distribuição das classificações não apresenta uniformidade entre as diferentes classificações como mostra a tabela a seguir.

| Classificação | Número de casos | Percentagem do Dataset |
| :------------ | :-------------: | ---------------------: |
| 1             |     52 268      |                  9,3 % |
| 2             |     29 769      |                  5,3 % |
| 3             |     42 640      |                  7,5 % |
| 4             |     80 655      |                 14,1 % |
| 5             |     363 122     |                 63,8 % |

É essencial reduzir a quantidade de casos e utilizar o mesmo número de casos da mesma classe para o treino do modelo preditivo. O dataset foi filtrado para a remoção de casos sem valor ou "null", no entanto nenhum dado foi removido dado que o dataset não continha valores null.

| Id | ProductId | UserId | ProfileName | Helpfulness Numerator | Helpfulness Denominator | Score | Time | Summary | Text |
|-----|-------------|-----------------|---------------|----------------------|------------------------|-------|------------|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|1 | B001E4KFG0 |A3SGXH7AUHU8GW |delmartian |1 |1 |5 |1303862400 |Good Quality Dog Food |I have bought several of the Vitality canned dog food products ...|
|2 |B00813GRG4 |A1D87F6ZCVE5NK |dll pa |0 |0 |1 |1346976000 |Not as Advertised| Product arrived labeled as Jumbo Salted Peanuts...
|3 |B000LQOCH0 |ABXLMWJIXXAIN |Natalia Corres "Natalia Corres" |1 |1 |4 |1219017600 |"Delight" says it all |This is a confection that has been around a few centuries. It is a light, ...|

# Pré-processamento

## Modelo de dados

Para o pré-processamento foi feito o agrupamento das classes 4 e 5, que criaram uma nova classe "Positiva", e agrupados as classes 1 e 2, que criaram a classe "Negative". Estas serão as classes propostas para previsão através de um texto posteriormente. Os textos com classificação "3" foram ignorados devido á natureza muito próxima das duas classificações apresentando um meio termo.

Adicionalmente, o dataset continha dois campos, nomeadamente "Summary" e "Text", que continham informação relevante á review do consumidor. Por isso, considerando que os dois campos são importantes para a percepção da classificação da review, os dois textos foram combinados de modo a gerar um campo "Full Review" que é a concatenação dos campos "Summary" e "Text" seguidos.

Com as classes finais já definidas é feito um filtro de modo a ficar com dois datasets, um para treino e um para teste. Deste modo foram considerados aleatóriamente 800 exemplos de classificação "Positiva" e 800 exemplos de classificação "Negativa" para treino. Já no dataset de teste foram considerados aleatóriamente 200 exemplos de classificação "Positiva" e 200 exemplos de classificação "Negativa". É de ressaltar que não existe a mesma ocorrencia de um caso em ambos os datasets.

## Tratamento de texto

O processamento do texto visa normalizar as palavras de modo a ter um ponto de partida para o treino do modelo com dados. As alterações ao texto original consistem nalguns passos subquentes como a remoção de letras capitalizadas, de modo a conter apenas letras descapitalizadas, remoção de simbolos para apenas conter letras de [a-z] e limpeza de espaços que não estejam entre palavras e repetição de espaços.

Os textos são processados de modo a manter palavras com o mesmo significado com um formato idêntico, exemplo: As palavras "working" e "work" são convertidas para a mesma palavra "work".

```javascript
function toLowerCase(inputText) {
  return inputText.toLowerCase();
}

function trimSpaces(inputText) {
  let trimmedText = inputText.trim();
  return trimmedText.replace(/\s+/g, " ");
}

function removeSpecialCharacters(inputText) {
  return inputText.replace(/[^a-z ]/gi, "");
}
```

Cada texto é então processado de modo a remover algumas palavras específicas como "o" e "d" que não dão impacto e ocorrem poucas vezes, normalmente devido a erros de escrita.

De seguida as palavras são agrupadas em bigramas e unigramas de modo a fornecer contexto em como ocorrem naturalmente nos textos como "not organic" e "great sauce".

```javascript
var stpw = require("./stopwords.js");
var stemmr = require("./stemming.js");
var ngram = require("./tokenization.js");
var clean = require("./clean.js");

module.exports = (inputText, numbers, stopWords = []) => {
  // Limpeza de dados
  let cleanText = clean(inputText);

  // Filtro de dados e ngram
  let removedStoppedWordsText = stpw.removeCustomStopwords(
    cleanText,
    stopWords
  );
  let stemmedText = stemmr(removedStoppedWordsText);
  let ngrams = numbers.map((number) => ngram(stemmedText, number));

  return {
    originalText: inputText,
    cleanedText: cleanText,
    preprocessedText: stemmedText,
    tokens: ngrams,
  };
};
```

## Cálculo de tf , idf e tfidf

Com os textos processados é feito o processamento dos valores de cada termo presente no conjunto de treino. Cada texto é processado, dividido em bigrama e unigrama, e calculado o valor de tf para o termo no documento.

Os valores são agrupados através da classificação do documento e posteriormente calculada os vetores tf, idf, tfidf, binary e numberOfOccurrences. Cada valor é posteriormente inserido na tabela "term" que contém todas as informações de cada termo encontrado no dataset de treino.

```javascript
const termData = [];

const idfVector = bagOfWrds.idfVector(workerBagOfWords, documents);

for (let i = 0; i < documents.length; i++) {
  const tfVector = bagOfWrds.tfVector(workerBagOfWords, documents[i]);
  const tfidfVector = bagOfWrds.tfidfVector(tfVector, idfVector);
  const binaryVector = bagOfWrds.binaryVector(workerBagOfWords, documents[i]);
  const occurrencesVector = bagOfWrds.numberOfOccurrencesVector(
    workerBagOfWords,
    documents[i]
  );

  for (let j = 0; j < workerBagOfWords.length; j++) {
    const word = workerBagOfWords[j];

    termData.push(
      new Term(
        word,
        binaryVector[j],
        occurrencesVector[j],
        tfVector[j],
        idfVector[j],
        tfidfVector[j],
        docIds[i],
        word.split(" ").length,
        classification
      )
    );
  }
}
```

Após o processamento dos termos, o resultado do processamento dos termos deixa um total de 130 996 ocorrências de termos, sendo 64 872 de classificação positiva e 66 124 de classificação negativa, o que demonstra um equilibrio entre termos positivos e termos negativos ao apresentarem ambas valores semelhantes. 

É possível analizar que as palavras que ocorrem com maior frequência por classe são as palavras "not" para a classe negative, e "good" para a classe positiva.

|classification| name | total_occurrences|
|--------------|------|:-----------------|
| 0            | not  |               872|
| 1            | good |               588|

## Cálculo de estatisticas para cada termo

Nesta fase, são recolhidos os termos das classes positivas e negativas, juntamente com unigramas e bigramas. São recolhidos quatro arrays com estas informações com cada combinação possível. Exemplo, positiva-unigrama, positiva-bigrama, negativa-unigrama ...

Estes dados servirão para calcular os melhores K termos, onde K representa 20% dos termos de cada array anteriormente referido. Foi utilizada a métrica tfIdf e a média desses valores para termos iguais.

``` javascript
async function processTermStatistics() {
    let resolvedResults = [
        await termRepository.getAllTermsWithFilters(0, 1), //classificação negativa / 0 e unigrama / 1
        await termRepository.getAllTermsWithFilters(0, 2),
        await termRepository.getAllTermsWithFilters(1, 1),
        await termRepository.getAllTermsWithFilters(1, 2)
    ]

    for (const terms of resolvedResults) {
        let results = featureSelection.selectKBest(terms, "tfIdf", true)
        for(const result of results){
            await termStatisticRepository.insertTermStatistic(result)
        }
    }

}
```


# Front-End

# Back-End

# Base de dados
