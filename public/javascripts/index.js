

document.getElementById('reviewForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the input value
    var inputValue = document.getElementById('reviewInputValue').value;

    // Update the form action with the input value
    var formAction = 'review/' + inputValue;
    document.getElementById('reviewForm').setAttribute('action', formAction);

    // Submit the form
    this.submit();
});

document.getElementById('positiveReviewsForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the input value
    var inputValue = document.getElementById('positiveReviewInputValue').value;

    // Update the form action with the input value
    var formAction = 'positiveReviews/' + inputValue;
    document.getElementById('positiveReviewsForm').setAttribute('action', formAction);

    // Submit the form
    this.submit();
});

document.getElementById('negativeReviewsForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the input value
    var inputValue = document.getElementById('negativeReviewInputValue').value;

    // Update the form action with the input value
    var formAction = 'negativeReviews/' + inputValue;
    document.getElementById('negativeReviewsForm').setAttribute('action', formAction);

    // Submit the form
    this.submit();
});