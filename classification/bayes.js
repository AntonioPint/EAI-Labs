const { getTrainingSet } = require("../database/repositories/trainAndTestingSets.js");


async function classProbability(classe){
    try {
        // Fetch the training set from the database
        let training_set = await getTrainingSet();
        if (training_set.length === 0) {
            throw new Error("Training set is empty.");
        }

        const classes = await Promise.all(
            training_set.map(p => {
                return p.class
            })
        )
        
        const totalNumberDocuments = classes.length;
        
        // Calculate the number of documents in the specified class
        let classCount;
        if (classe === 1) {
            classCount = classes.filter(doc => doc=== 1).length;
        } else if (classe === 0) {
            classCount = classes.filter(doc => doc === 0).length;
        } else {
            throw new Error("Invalid class specified. Use 'positive' or 'negative'.");
        }
        // Calculate the prior probability P(ω)
        const classProbability = classCount / totalNumberDocuments;

        return classProbability;
    } catch (error) {
        console.error("Error calculating class probability:", error);
        throw error;
    }
}


module.exports = {
    classProbability: classProbability,
}