
module.exports = class FoodReview {
    constructor(data) {
        this.id = data.Id,
        this.productId = data.ProductId,
        this.userId = data.UserId,
        this.profileName = data.ProfileName
        this.score = data.Score,
        this.text = data.FullReview
    }
}