
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

function getTermTfidfSum(){
    return new Promise((resolve, reject) => {
        connection.query("select classification, sum(t.tfidf) as `tfidf` from term t group by t.classification;", function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            let map = new Map()
            rows.map((e) => {
                map.set(e.classification, e.tfidf)
            })
            resolve(map);
        });
    });
}


function getTermsTfidf(tokens){
    return new Promise((resolve, reject) => {
        // Assume tokens are safely preprocessed and sanitized
        // Prepare the token list for SQL usage
        const tokenList = tokens.map(token => `'${token}'`).join(',');

        // Construct the SQL query
        const query = `
            SELECT 
                t.classification,
                t.name as name,
                SUM(t.tfidf) AS tfidf
            FROM 
                term t
            WHERE 
                t.name IN (${tokenList})
            GROUP BY 
                t.classification, t.name;
        `;

        connection.query(query, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            let idfMap = new Map();

            // Initialize the map with default values
            tokens.forEach(token => {
                idfMap.set(token, {
                    name: token,
                    positiveTfIdf: 1, // Default value if no positive classification is found
                    negativeTfIdf: 1  // Default value if no negative classification is found
                });
            });
        
            // Process each row to fill in the actual tfidf values
            rows.forEach(row => {
                let entry = idfMap.get(row.name);
                if (row.classification === 0) {
                    entry.negativeTfIdf = row.tfidf;
                } else if (row.classification === 1) {
                    entry.positiveTfIdf = row.tfidf;
                }
                idfMap.set(row.name, entry);
            });
        
            // Convert the map to an array of values
            let result = Array.from(idfMap.values());
            resolve(result);
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
    getTermTfidfSum: getTermTfidfSum,
    getTermsTfidf: getTermsTfidf,
}