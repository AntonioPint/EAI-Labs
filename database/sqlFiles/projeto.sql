use lojacarl_EAI_HotelReviews_Lab;
/*
CREATE TABLE food_review (
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

select count(*) from lojacarl_EAI_HotelReviews_Lab.food_review;

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
FROM lojacarl_EAI_HotelReviews_Lab.food_review;

ALTER TABLE lojacarl_EAI_HotelReviews_Lab.food_review
ADD COLUMN FullReview TEXT;

Start transaction;
SET SQL_SAFE_UPDATES = 0;
UPDATE lojacarl_EAI_HotelReviews_Lab.food_review
SET FullReview = CONCAT(Summary, ' ', Text);
SET SQL_SAFE_UPDATES = 1;
commit;

select count(*) from lojacarl_EAI_HotelReviews_Lab.food_review where score > 3;
select count(*) from lojacarl_EAI_HotelReviews_Lab.food_review where score < 3;
*/
-- removido duplicados

SET SQL_SAFE_UPDATES = 0;
start transaction;
DELETE FROM food_review
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT MIN(id) AS id
        FROM food_review
        GROUP BY Text
    ) AS temp_table
);
rollback;
commit;

SET SQL_SAFE_UPDATES = 1;

drop table training_set ;
create table training_set (
	id int not null auto_increment,
    review_id int,
    class int not null,
    primary key (id) ,
    foreign key (review_id) references food_review(id)
);
drop table testing_set ;
create table testing_set (
	id int not null auto_increment,
    review_id int,
	class int not null,
    primary key (id) ,
    foreign key (review_id) references food_review(id)
);


insert into training_set (review_id, class)
select * from (
	SELECT fr.id, 0
	FROM food_review fr
	WHERE fr.Score < 3
	AND fr.id NOT IN (
		SELECT result.review_id 
		FROM (
			SELECT review_id FROM testing_set 
			UNION 
			SELECT review_id FROM training_set
		) result
	)
	order by fr.Score asc
	LIMIT 1000
) as subquery 
order by rand() 
limit 800;

insert into testing_set (review_id, class)
select * from (
	SELECT fr.id, 0
	FROM food_review fr
	WHERE fr.Score < 3
	AND fr.id NOT IN (
		SELECT result.review_id 
		FROM (
			SELECT review_id FROM testing_set 
			UNION 
			SELECT review_id FROM training_set
		) result
	)
	order by fr.Score asc
	LIMIT 1000
) as subquery 
order by rand() 
limit 200;

-- -------------------------------------------------


insert into training_set (review_id, class)
select * from (
	SELECT fr.id, 1
	FROM food_review fr
	WHERE fr.Score > 3
	AND fr.id NOT IN (
		SELECT result.review_id 
		FROM (
			SELECT review_id FROM testing_set 
			UNION 
			SELECT review_id FROM training_set
		) result
	)
	order by fr.Score asc
	LIMIT 1000
) as subquery 
order by rand() 
limit 800;

insert into testing_set (review_id, class)
select * from (
	SELECT fr.id, 1
	FROM food_review fr
	WHERE fr.Score > 3
	AND fr.id NOT IN (
		SELECT result.review_id 
		FROM (
			SELECT review_id FROM testing_set 
			UNION 
			SELECT review_id FROM training_set
		) result
	)
	order by fr.Score asc
	LIMIT 1000
) as subquery 
order by rand() 
limit 200;


select * from training_set tas inner join testing_set tes on tes.review_id = tas.review_id; -- should be empty

select count(*) from training_set where class = 0;
select count(*) from training_set where class = 1;
select count(*) from testing_set where class = 0;
select count(*) from testing_set where class = 1;
