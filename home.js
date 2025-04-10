document.getElementById("start").addEventListener("click", async function() {
    const button = this;
    button.disabled = true;
    try {
        const correctedResult = await getCorrectedText(document.getElementById("textbox").value);
        document.getElementById("corrections").innerHTML = correctedResult;
    } catch (error) {
        document.getElementById("corrections").textContent = "Error processing text";
    } finally {
        button.disabled = false;
    }
});
async function getCorrectedText(text) {
    const word = text.split(/(\s+|\W+)/);
    const corrected = [];
    for (const wordPlace of word) {
        if (/\w/.test(wordPlace)) {
            const correction = await getBestCorrection(wordPlace);
            if (correction && correction.toLowerCase() !== wordPlace.toLowerCase()) {
                corrected.push(`<span class="error">${correction}</span>`);
            } else {
                corrected.push(wordPlace);
            }
        } else {
            corrected.push(wordPlace);
        }
    }
    return corrected.join('');
}
async function getBestCorrection(myWord) {
    const checkResponse = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(myWord)}`);
    const checkResponseResult = await checkResponse.json();
    if (checkResponseResult.some(item => item.word === myWord.toLowerCase())) {
        return null;
    }
    const suggestResponse = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(myWord)}`);
    const suggestResponseResult = await suggestResponse.json();
    if (suggestResponseResult.length > 0) {
        return preserveCase(myWord, suggestResponseResult[0].word);
    }
    return null;
}

function preserveCase(original, corrected) {
    if (original === original.toUpperCase()) {
        return corrected.toUpperCase();
    } else if (original[0] === original[0].toUpperCase()) {
        return corrected.charAt(0).toUpperCase() + corrected.slice(1);
    }
    return corrected;
}