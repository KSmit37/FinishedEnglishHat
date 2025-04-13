document.getElementById("start").addEventListener("click", async function() {
    const button = this;
    button.disabled = true; //disable button
    try { // try catch
        const correctedResult = await getCorrectedText(document.getElementById("textbox").value);//get the corrected paragraph
        document.getElementById("corrections").innerHTML = correctedResult; //put into the textbox oj the side
    } catch (error) {
        document.getElementById("corrections").textContent = "Error processing text"; //incase of error if API limit is exeeded
    } finally {
        button.disabled = false; //enable button
    }
});
async function getCorrectedText(text) {
    const word = text.split(/(\s+|\W+)/); //spit into spaces and words
    const corrected = []; //list for the corrected text
    for (const wordPlace of word) {  //for every element from before (Word or whitespace)
        if (/\w/.test(wordPlace)) {  //if its a word
            const correction = await getBestCorrection(wordPlace);   //get the best correction from other method
            if (correction && correction.toLowerCase() !== wordPlace.toLowerCase()) { //if the correction is different
                corrected.push(`<span class="error">${correction}</span>`);//push the correction into the list with the class error to make it a different color and highligted
            } else { //If it returns null (its the same)
                corrected.push(wordPlace); //word was correct so push the same word
            }
        } else {
            corrected.push(wordPlace); //if its a space then just push the space
        }
    }
    return corrected.join(''); //join the list to make on paragraph
}
async function getBestCorrection(myWord) {
    const checkResponse = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(myWord)}`); //see if the word is in the library
    const checkResponseResult = await checkResponse.json();
    if (checkResponseResult.some(item => item.word === myWord.toLowerCase())) { //if the word is the same as the new word then it is correct and return nothing
        return null;
    }
    const suggestResponse = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(myWord)}`);//get best suggestion for the word
    const suggestResponseResult = await suggestResponse.json();
    if (suggestResponseResult.length > 0) { //if there are any words suggested then use the first one
        return preserveCase(myWord, suggestResponseResult[0].word);
    }
    return null;//if there are no suggestions
}

function preserveCase(original, corrected) {
    if (original === original.toUpperCase()) { //if the whole word is uppercase
        return corrected.toUpperCase(); //return the corrected to uppercase
    } else if (original[0] === original[0].toUpperCase()) { //if the first letter is uppercase
        return corrected.charAt(0).toUpperCase() + corrected.slice(1); //return the uppercase first letter
    }
    return corrected; //if no uppercases then return normal lowercased word
}