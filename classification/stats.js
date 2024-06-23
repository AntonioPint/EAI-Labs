// stats.js
const minimist = require('minimist');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const start = args.start ? parseInt(args.start, 10) : null;
const end = args.end ? parseInt(args.end, 10) : null;

const { getTestingSet } = require("../database/repositories/trainAndTestingSets");
const { cossineSimilarityResult, probabilisticClassification } = require("../classification/classifier.js");


async function getStats(method) {
    let testingSet = await getTestingSet();
    testingSet = testingSet.slice(190,210)
    // Slice the array if start and end parameters are provided
    if (start !== null && end !== null) {
        testingSet = testingSet.slice(start, end);
    }
    

    // Transformar a estrutura dos dados
    let predictions;
    if(method === "cossine"){
        predictions = await Promise.all(testingSet.map(async (item) => {
            const result = await cossineSimilarityResult(item.review_text);
            return {
                document: item.review_text,
                real: item.class,
                predicted: result['decision']
            };
        }));
    }
    else if(method === "bayes"){
        predictions = await Promise.all(testingSet.map(async (item) => {
            const result = await probabilisticClassification(item.review_text);
            return {
                document: item.review_text,
                real: item.class,
                predicted: result['decision']
            };
        }));
    }

    const cm = confusionMatrix(predictions);
    
    // Calcular precisão
    const prec = precision(cm);
    
    // Calcular cobertura
    const rec = recall(cm);
    
    // Calcular F1-score
    const f1 = fMeasure(cm);

    return {
        matrix: cm,
        prec: prec,
        rec: rec,
        f1: f1,
        debugPredictions: predictions
    }

}


/**
 * confusionMatrix
 * @param {Array} predictions - Array de objetos com o documento, classe prevista e classe real
 * @returns {Array} Matriz de confusão 2x2
 */
function confusionMatrix(predictions) {
    let TP = 0, FN = 0, FP = 0, TN = 0;

    predictions.forEach(item => {
        const real = item.real;
        const predicted = item.predicted;

        if (real == 1 && predicted == 1) {
            TP += 1;
        } else if (real == 1 && predicted == 0) {
            FN += 1;
        } else if (real == 0 && predicted == 1) {
            FP += 1;
        } else if (real == 0 && predicted == 0) {
            TN += 1;
        }
    });

    return [[TP, FN], [FP, TN]];
}

/**
 * precision
 * @param {Array} matrix - Matriz de confusão
 * @returns {Number} Precisão do classificador
 */
function precision(matrix) {
    const [TP, FN] = matrix[0];
    const [FP, TN] = matrix[1];

    if (TP + FP === 0) {
        return 0.0; // Evitar divisão por zero
    }
    return TP / (TP + FP);
}

/**
 * recall
 * @param {Array} matrix - Matriz de confusão
 * @returns {Number} Cobertura do classificador
 */
function recall(matrix) {
    const [TP, FN] = matrix[0];
    const [FP, TN] = matrix[1];

    if (TP + FN === 0) {
        return 0.0; // Evitar divisão por zero
    }
    return TP / (TP + FN);
}

/**
 * fMeasure
 * @param {Array} matrix - Matriz de confusão
 * @returns {Number} F1-score do classificador
 */
function fMeasure(matrix) {
    const prec = precision(matrix);
    const rec = recall(matrix);

    if (prec + rec === 0) {
        return 0.0; // Evitar divisão por zero
    }
    return 2 * (prec * rec) / (prec + rec);
}

// Exportar as funções para serem utilizadas em outros módulos
module.exports = {
    confusionMatrix,
    precision,
    recall,
    fMeasure,
    getStats
};
