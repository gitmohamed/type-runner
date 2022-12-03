import { Readable } from 'stream';
import randy from 'randy';
import phrases from './utils/phrases'
import makeSentenceFromTemplate from './utils/makeSentenceFromTemplate'

function handler(req, res) {
  const num = req.query.count || 4;
  var sentenceStream = new Readable;
  var count = 0;

  sentenceStream._read = function () {
    count++;

    // if (count === 1) {
    //   sentenceStream.push('{"text":"');
    // }

    var last = (count === constrain(num, 12));

    sentenceStream.push(generateSentenceForStream(last));

    if (last) {
      return sentenceStream.push(null);
    }
  };

  // if (jsonFormat) {
  //   res.setHeader("Content-Type", "application/json");
  // } else {
  //   res.setHeader("Content-Type", "text/plain");
  // }
  res.setHeader("Content-Type", "text/plain");

  sentenceStream.pipe(res);
  return res.status(200);
}

function constrain(input, max) {
  return Math.min(input, max);
}
  
function generateSentenceForStream(last) {
  // make a sentence. perhaps it has a starting phrase.
  var phrase = randomStartingPhrase();
  var sentence = capitalizeFirstLetter( phrase + makeSentenceFromTemplate() ) + ".";
  // add a space if it's not the last one
  sentence += ((last) ? "" : " ");
  return sentence;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// returns a starting phrase about a third of the time, otherwise it's empty
function randomStartingPhrase() {
  if(Math.random() < 0.33) {
    return randy.choice(phrases);
  }
  return "";
}

export default handler;