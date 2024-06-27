

const connection = require("../config.js");
const Term = require("../dto/Term.js");
const TermStatistic = require("../dto/TermStatistic.js");


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

function getTermStatisticsFormated() {
    let sql = ` SELECT cl.class AS label,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'name', ts.name,
                            'tfidf', ts.tfidf,
                            'tf', ts.tf  
                        )
                    ) AS bagOfWords
                FROM term_statistic ts
                JOIN termClass cl ON ts.classification = cl.class
                GROUP BY cl.description
                LIMIT 0, 1000;`;

    return new Promise((resolve, reject) => {
        connection.query(sql, function (err, rows, fields) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });

}

function getTermStatisticTfidfSum(){
    return new Promise((resolve, reject) => {
        connection.query("select classification, sum(ts.tfidf) as `tfidf` from term_statistic ts group by ts.classification;", function (err, rows, fields) {
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

function getTermStatisticTfidf(tokens){
    return new Promise((resolve, reject) => {
        // Assume tokens are safely preprocessed and sanitized
        // Prepare the token list for SQL usage
        const tokenList = tokens.map(token => `'${token}'`).join(',');

        // Construct the SQL query
        const query = `
            SELECT 
                ts.classification,
                ts.name as name,
                ts.tfidf AS tfidf
            FROM 
                term_statistic ts
            WHERE 
                ts.name IN (${tokenList})
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

class TermStatisticDTO {
    constructor(name, binary, occurrences, tf, tfidf, docIds, classification) {
        this.name = name;
        this.binary = binary;
        this.occurrences = occurrences;
        this.tf = tf;
        this.tfidf = tfidf;
        this.docIds = docIds;
        this.classification = classification;
    }

    static termStatisticDTOToTermStatistics(termStatisticDTO) {
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

    static termStatisticTotermStatisticDTO(termStatistic) {
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
    getTermStatisticsFormated: getTermStatisticsFormated,
    getTermStatisticTfidfSum: getTermStatisticTfidfSum,
    getTermStatisticTfidf: getTermStatisticTfidf,
}