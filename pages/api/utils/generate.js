
export default function generate(numberOfSentences) {
    var sentences = "";
    for(var i = 0; i < numberOfSentences; i++) {
        sentences += capitalizeFirstLetter( randomStartingPhrase() + makeSentenceFromTemplate()) + ".";
        sentences += (numberOfSentences > 1) ? " " : "";
    }
    return sentences;
}