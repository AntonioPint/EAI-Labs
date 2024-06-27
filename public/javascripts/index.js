

document.getElementById('reviewForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the input value
  var inputValue = document.getElementById('reviewInputValue').value;

  // Update the form action with the input value
  var formAction = 'reviewFood/' + inputValue;
  document.getElementById('reviewForm').setAttribute('action', formAction);

  // Submit the form
  this.submit();
});

document.getElementById('positiveReviewsForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the input value
  var inputValue = document.getElementById('positiveReviewInputValue').value;

  // Update the form action with the input value
  var formAction = 'positiveReviews/' + inputValue;
  document.getElementById('positiveReviewsForm').setAttribute('action', formAction);

  // Submit the form
  this.submit();
});

document.getElementById('negativeReviewsForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the input value
  var inputValue = document.getElementById('negativeReviewInputValue').value;

  // Update the form action with the input value
  var formAction = 'negativeReviews/' + inputValue;
  document.getElementById('negativeReviewsForm').setAttribute('action', formAction);

  // Submit the form
  this.submit();
});

document.getElementById('classifierForm').addEventListener('submit', function (event) {
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
      if (result.decision === 0) {
        classifierResult.textContent = "Negative";
        classifierResult.style.color = "red";
      } else if (result.decision === 1) {
        classifierResult.textContent = "Positive";
        classifierResult.style.color = "green";
      }

      similarityValues.textContent = `Similarity values: ${result.similarityCossenPositiveNegative.join(', ')}`;
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

document.getElementById('form-matrix').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission


  fetch('matrix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  })
    .then(response => response.json())
    .then(result => {

      document.getElementById("tpResult").innerText = result.matrix[0][0];
      document.getElementById("fnResult").innerText = result.matrix[0][1];
      document.getElementById("fpResult").innerText = result.matrix[1][0];
      document.getElementById("tnResult").innerText = result.matrix[1][1];

      document.getElementById("prec").innerText += result.prec;
      document.getElementById("rec").innerText += result.rec;
      document.getElementById("f1").innerText += result.f1;

      document.getElementById("table-matrix").style.display = "";
      document.getElementById("form-matrix").style.display = "none";


    })
    .catch(error => {
      console.error('Error:', error);
    });

});

document.getElementById('classifierForm2').addEventListener('submit', function (event) {
  event.preventDefault();

  const phrase = document.getElementById('textToclassify2').value;

  fetch('classify2', {
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
      const classifierResult = document.getElementById('classifierResult2');
      const similarityValues = document.getElementById('similarityValues2');
      if (result.decision === 0) {
        classifierResult.textContent = "Negative";
        classifierResult.style.color = "red";
      } else if (result.decision === 1) {
        classifierResult.textContent = "Positive";
        classifierResult.style.color = "green";
      }
      similarityValues.textContent = `Values of the products of probabilities: ${result.naiveBayes.join(', ')}`;
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

document.getElementById('form-matrix2').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission


  fetch('matrix2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  })
    .then(response => response.json())
    .then(result => {

      document.getElementById("tpResult2").innerText = result.matrix[0][0];
      document.getElementById("fnResult2").innerText = result.matrix[0][1];
      document.getElementById("fpResult2").innerText = result.matrix[1][0];
      document.getElementById("tnResult2").innerText = result.matrix[1][1];

      document.getElementById("prec2").innerText += result.prec;
      document.getElementById("rec2").innerText += result.rec;
      document.getElementById("f1_2").innerText += result.f1;

      document.getElementById("table-matrix2").style.display = "";
      document.getElementById("form-matrix2").style.display = "none";

    })
    .catch(error => {
      console.error('Error:', error);
    });

});