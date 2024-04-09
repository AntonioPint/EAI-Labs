use eai;

-- ALTER TABLE hotel_review
-- ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;


drop table training_set ;
create table training_set (
	id int not null auto_increment,
    review_id int,
    class int not null,
    primary key (id) ,
    foreign key (review_id) references hotel_review(id)
);
drop table testing_set ;
create table testing_set (
	id int not null auto_increment,
    review_id int,
	class int not null,
    primary key (id) ,
    foreign key (review_id) references hotel_review(id)
);

select count(*) from training_set;
select count(*) from testing_set;
select * from hotel_review;

select count(*) from hotel_review where Reviewer_Score < 3;
select count(*) from hotel_review where Reviewer_Score > 8;


INSERT INTO training_set (review_id, class)
SELECT ht.id, 0
FROM hotel_review ht
WHERE ht.Reviewer_Score < 3
AND ht.id NOT IN (
    SELECT result.review_id 
    FROM (
        SELECT review_id FROM testing_set 
        UNION 
        SELECT review_id FROM training_set
    ) result
)
LIMIT 800;

INSERT INTO training_set (review_id, class)
SELECT ht.id, 1
FROM hotel_review ht
WHERE ht.Reviewer_Score >= 8
AND ht.id NOT IN (
    SELECT result.review_id 
    FROM (
        SELECT review_id FROM testing_set 
        UNION 
        SELECT review_id FROM training_set
    ) result
)
LIMIT 800;
-------------------------------------------------
INSERT INTO testing_set (review_id, class)
SELECT ht.id, 0
FROM hotel_review ht
WHERE ht.Reviewer_Score < 3 
AND ht.id NOT IN (
    SELECT result.review_id 
    FROM (
        SELECT review_id FROM testing_set 
        UNION 
        SELECT review_id FROM training_set
    ) result
)
LIMIT 200;

INSERT INTO testing_set (review_id, class)
SELECT ht.id, 1
FROM hotel_review ht
WHERE ht.Reviewer_Score >= 8 
AND ht.id NOT IN (
    SELECT result.review_id 
    FROM (
        SELECT review_id FROM testing_set 
        UNION 
        SELECT review_id FROM training_set
    ) result
)
LIMIT 200;

select * from training_set tas inner join testing_set tes on tes.review_id = tas.review_id

-- select hr.Negative_Review FROM hotel_review hr inner join training_set ts on hr.id = ts.review_id where ts.class = 1

