const HotelReview = require("../database/dto/hotelReview.js")
const connection = require("../database/config.js");


function getTrainingSet(my_class){
    if (isNaN(my_class) || (my_class != 0 && my_class != 1)){
        throw "parameter should be either 0 or 1"
    }

    let text_column = my_class == 1 ? "Positive_Review" : "Negative_Review"

    return new Promise((resolve, reject) => {
        connection.query("select hr." + text_column +" FROM hotel_review hr inner join training_set ts on hr.id = ts.review_id where ts.class = ?;", [my_class] , function (err, rows, fields) {
            if (err) {
                reject(err); 
                connection.destroy()
                return;
            }
            resolve(rows); 
        });
    });
}

module.exports = {
    getTrainingSet: getTrainingSet
}
