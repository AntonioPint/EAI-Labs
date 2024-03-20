
module.exports = class HotelReview {
    constructor(data) {
        this.id = data.id;
        this.hotelAddress = data.Hotel_Address;
        this.additionalNumberOfScoring = data.Additional_Number_of_Scoring;
        this.reviewDate = new Date(data.Review_Date);
        this.averageScore = data.Average_Score;
        this.hotelName = data.Hotel_Name;
        this.reviewerNationality = data.Reviewer_Nationality.trim();
        this.negativeReview = data.Negative_Review;
        this.reviewTotalNegativeWordCounts = data.Review_Total_Negative_Word_Counts;
        this.totalNumberOfReviews = data.Total_Number_of_Reviews;
        this.positiveReview = data.Positive_Review;
        this.reviewTotalPositiveWordCounts = data.Review_Total_Positive_Word_Counts;
        this.totalNumberOfReviewsReviewerHasGiven = data.Total_Number_of_Reviews_Reviewer_Has_Given;
        this.reviewerScore = data.Reviewer_Score;
        this.tags = JSON.parse(data.Tags.replace(/'/g, '"'));
        this.daysSinceReview = data.days_since_review;
        this.lat = data.lat;
        this.lng = data.lng;
    }
}