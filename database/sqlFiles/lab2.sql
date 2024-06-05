-- use eai;
use lojacarl_EAI_HotelReviews_Lab;
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


insert into training_set (review_id, class)
select * from (
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
	order by ht.Reviewer_Score asc
	LIMIT 200
) as subquery 
order by rand() 
limit 160;

insert into testing_set (review_id, class)
select * from (
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
	order by ht.Reviewer_Score asc
	LIMIT 200
) as subquery 
order by rand() 
limit 40;

-- ------------------------------------------------

insert into training_set (review_id, class)
select * from (
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
	order by ht.Reviewer_Score asc
	LIMIT 200
) as subquery 
order by rand() 
limit 160;

insert into testing_set (review_id, class)
select * from (
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
	order by ht.Reviewer_Score asc
	LIMIT 200
) as subquery 
order by rand() 
limit 40;


select * from training_set tas inner join testing_set tes on tes.review_id = tas.review_id -- should be empty

-- select hr.Negative_Review FROM hotel_review hr inner join training_set ts on hr.id = ts.review_id where ts.class = 1

