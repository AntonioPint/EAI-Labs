

document.getElementById('reviewForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the input value
    var inputValue = document.getElementById('reviewInputValue').value;

    // Update the form action with the input value
    var formAction = 'reviewFood/' + inputValue;
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

document.getElementById('classifierForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const phrase = document.getElementById('textToclassify').value;

    fetch('classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'phrase': phrase
      })
    })
    .then(response => response.json())
    .then(result => {
      const classifierResult = document.getElementById('classifierResult');
      const similarityValues = document.getElementById('similarityValues');

      if (result.decision === "Negative") {
        classifierResult.textContent = "Negative";
        classifierResult.style.color = "red";
      } else if (result.decision === "Positive") {
        classifierResult.textContent = "Positive";
        classifierResult.style.color = "green";
      }

      similarityValues.textContent = `Similarity values: ${result.similarityCossenPositiveNegative.join(', ')}`;
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });