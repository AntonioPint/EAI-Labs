
const connection = require("../config.js");
const Term = require("../dto/Term.js");


function getTerm(id) {
    if (id == null) throw "Id deve ser fornecido"
    if (isNaN(id)) throw "Id deve ser um número"


    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM term WHERE id = ? ;", [id], function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let result = rows.map(e => new Term(e))[0]
            resolve(result);
        });
    });

}

function getAllTerms() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM term", function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let result = rows.map(e => {
                return new Term(e.name, e.binary, e.occurrences, e.tf, e.idf, e.tfidf, e.docId, e.wordCount, e.classification)
            })
            resolve(result);
        });
    });
}

function getAllTermsWithFilters(classification, wordCount) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM term where classification = ? and wordCount = ?", [classification, wordCount], function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let result = rows.map(e => {
                return new Term(e.name, e.binary, e.occurrences, e.tf, e.idf, e.tfidf, e.docId, e.wordCount, e.classification)
            })
            resolve(result);
        });
    });
}

function getIdfOfTerms(classification) {
    let sql = "select t.name, sum(t.occurrences) as `occurrences`, idf , classification from term t where classification = ? group by t.name;"

    return new Promise((resolve, reject) => {
        connection.query(sql, [classification], function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let map = new Map()
            rows.map((e) => {
                map.set(e.name, { occurrences: e.occurrences, idf: e.idf, classification: e.classification })
            })
            resolve(map);
        });
    });
}

function getTermCount() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT COUNT(*) AS count FROM term", function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows[0].count);
        });
    });
}


function insertTerm(term) {
    if (term == null) throw "Term must be provided";

    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO term (name, \`binary\`, occurrences, tf, idf, tfidf, docId, wordCount, classification)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            term.name,
            term.binary,
            term.occurrences,
            term.tf,
            term.idf,
            term.tfidf,
            term.docId,
            term.wordCount,
            term.classification
        ], function (err, rows, fields) {
            if (err) {
                console.error("Error inserting Term at table term:", err);
                reject(err);
                return;
            }

            // Assuming 'Term' is defined somewhere
            let result = rows
            resolve(result);
        });
    });
}

function truncateTable() {
    return new Promise((resolve, reject) => {
        connection.query('TRUNCATE TABLE term', (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    getTerm: getTerm,
    getAllTerms: getAllTerms,
    insertTerm: insertTerm,
    getIdfOfTerms: getIdfOfTerms,
    getTermCount: getTermCount,
    truncateTable: truncateTable,
    getAllTermsWithFilters: getAllTermsWithFilters,
}