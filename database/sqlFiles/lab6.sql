SELECT 
    name, 
    tf, 
    tfidf, 
    classification
FROM 
    term_statistic
GROUP BY 
    name, classification
ORDER BY 
    classification, name;
