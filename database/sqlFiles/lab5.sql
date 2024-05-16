CREATE TABLE term (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    `binary` TINYINT NOT NULL,
    occurrences INT NOT NULL,
    tf FLOAT NOT NULL,
    idf DOUBLE NOT NULL,
    tfidf FLOAT NOT NULL,
    docId INT NOT NULL,
    wordCount INT NOT NULL,
    classification INT NOT NULL
);
drop table if exists term_statistic;
CREATE TABLE IF NOT EXISTS term_statistic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    `binary` FLOAT NOT NULL,
    occurrences FLOAT NOT NULL,
    tf FLOAT NOT NULL,
    tfidf FLOAT NOT NULL,
    docIds TEXT NOT NULL, -- Using TEXT for storing arrays of document IDs
    classification INT NOT NULL
);


