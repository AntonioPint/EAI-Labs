

const connection = require("../config.js");
const Term = require("../dto/Term.js");
const TermStatistic = require("../dto/termStatistic.js");


function getTermStatistic(id) {
    if (id == null) throw "Id deve ser fornecido"
    if (isNaN(id)) throw "Id deve ser um número"


    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM term_statistic WHERE id = ? ;", [id], function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let result = rows.map(e => new TermStatisticDTO.termStatisticDTOToTermStatistics(e))[0]
            resolve(result);
        });
    });
}

function getAllTermsStatistics() {

    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM term_statistic", function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let result = rows.map(e => TermStatisticDTO.termStatisticDTOToTermStatistics(e))
            resolve(result);
        });
    });
}

function getTermStatisticCount() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT COUNT(*) AS count FROM term_statistic", function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows[0].count);
        });
    });
}

function insertTermStatistic(term) {
    if (term == null) throw "Term must be provided";

    let termDTO = TermStatisticDTO.termStatisticTotermStatisticDTO(term)

    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO term_statistic (name, \`binary\`, occurrences, tf, tfidf, docIds, classification)
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            termDTO.name,
            termDTO.binary,
            termDTO.occurrences,
            termDTO.tf,
            termDTO.tfidf,
            termDTO.docIds,
            termDTO.classification
        ], function (err, rows, fields) {
            if (err) {
                console.error("Error inserting TermStatistic at table term_statistic:", err);
                reject(err);
                return;
            }
            let result = rows
            resolve(result);
        });
    });
}

function truncateTable() {
    return new Promise((resolve, reject) => {
        connection.query('TRUNCATE TABLE term_statistic', (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

class TermStatisticDTO{
    constructor(name, binary, occurrences, tf, tfidf, docIds, classification){
        this.name = name;
        this.binary = binary;
        this.occurrences = occurrences;
        this.tf = tf;
        this.tfidf = tfidf;
        this.docIds = docIds;
        this.classification = classification;
    }

    static termStatisticDTOToTermStatistics(termStatisticDTO){
        return new TermStatistic(
            termStatisticDTO.name,
            termStatisticDTO.binary,
            termStatisticDTO.occurrences,
            termStatisticDTO.tf,
            termStatisticDTO.tfidf,
            JSON.parse(termStatisticDTO.docIds),
            termStatisticDTO.classification
        )
    }

    static termStatisticTotermStatisticDTO(termStatistic){
        return new TermStatisticDTO(
            termStatistic.name,
            termStatistic.binary,
            termStatistic.occurrences,
            termStatistic.tf,
            termStatistic.tfidf,
            JSON.stringify(termStatistic.docIds),
            termStatistic.classification
        )
    }
}

module.exports = {
    TermStatisticDTO,
    getTermStatistic: getTermStatistic,
    getAllTermsStatistics: getAllTermsStatistics,
    insertTermStatistic: insertTermStatistic,
    getTermStatisticCount: getTermStatisticCount,
    truncateTable: truncateTable,
}