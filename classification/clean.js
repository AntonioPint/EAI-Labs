function toLowerCase(inputText) {
	return inputText.toLowerCase();
}

function trimSpaces(inputText) {
	let trimmedText = inputText.trim();
	return trimmedText.replace(/\s+/g, " ");
}

function removeSpecialCharacters(inputText) {
	return inputText.replace(/[^a-z ]/gi, "");
}

module.exports = (inputText) => {
	let toLowerCaseText = toLowerCase(inputText);
	let trimedSpacesText = trimSpaces(toLowerCaseText);

	return removeSpecialCharacters(trimedSpacesText);
};
