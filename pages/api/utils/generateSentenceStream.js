import phrases from '../data/phrases'
import makeSentenceFromTemplate from './makeSentenceFromTemplate'
import randy from 'randy';

export default function generateSentenceForStream(last) {
    // make a sentence. perhaps it has a starting phrase.
    var phrase = randomStartingPhrase();
    var sentence = capitalizeFirstLetter( phrase + makeSentenceFromTemplate() ) + ".";
    // add a space if it's not the last one
    sentence += ((last) ? "" : " ");
    return sentence;
}

// returns a starting phrase about a third of the time, otherwise it's empty
function randomStartingPhrase() {
    if(Math.random() < 0.33) {
        return randy.choice(phrases);
    }
    return "";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
