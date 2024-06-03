CREATE TABLE food_reviews (
    Id INT PRIMARY KEY,
    ProductId VARCHAR(255),
    UserId VARCHAR(255),
    ProfileName VARCHAR(255),
    HelpfulnessNumerator INT,
    HelpfulnessDenominator INT,
    Score INT,
    Time BIGINT,
    Summary TEXT,
    Text TEXT
);

select count(*) from lojacarl_EAI_HotelReviews_Lab.food_reviews;

SELECT 
    COUNT(*) AS TotalRows,
    COUNT(*) - COUNT(Id) AS Id_NULL_Count,
    COUNT(*) - COUNT(ProductId) AS ProductId_NULL_Count,
    COUNT(*) - COUNT(UserId) AS UserId_NULL_Count,
    COUNT(*) - COUNT(ProfileName) AS ProfileName_NULL_Count,
    COUNT(*) - COUNT(HelpfulnessNumerator) AS HelpfulnessNumerator_NULL_Count,
    COUNT(*) - COUNT(HelpfulnessDenominator) AS HelpfulnessDenominator_NULL_Count,
    COUNT(*) - COUNT(Score) AS Score_NULL_Count,
    COUNT(*) - COUNT(Time) AS Time_NULL_Count,
    COUNT(*) - COUNT(Summary) AS Summary_NULL_Count,
    COUNT(*) - COUNT(Text) AS Text_NULL_Count
FROM lojacarl_EAI_HotelReviews_Lab.food_reviews;

ALTER TABLE lojacarl_EAI_HotelReviews_Lab.food_reviews
ADD COLUMN FullReview TEXT;

UPDATE lojacarl_EAI_HotelReviews_Lab.food_reviews
SET FullReview = CONCAT(Summary, ' ', Text);
