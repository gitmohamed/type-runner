import { Readable } from 'stream';
import Sentencer from 'sentencer';
import randy from 'randy';
import phrases from './utils/phrases'
import sentenceTemplates from './utils/sentenceTemplates'
import makeSentenceFromTemplate from './utils/makeSentenceFromTemplate'

async function handler(req, res) {
  var paragraphsCount = req.query.paragraphs || 1;
  var sentenceCount = req.query.sentences || randy.randInt(3, 6);
  // var pTag = !!req.query;

  var paragraphStream = new Readable;
  var pCount = 1;
  var sCount = 0;
  
  // var pJsonFormat = true;
  var loopCount = 0;

  paragraphStream._read = function () {
    sCount++;
    loopCount++;

    // if (pJsonFormat && loopCount === 1) {
    //   paragraphStream.push('{"text":"');
    // }

    var endOfParagraph = (sCount === constrain(sentenceCount, 5));
    var endOfStream = (pCount === constrain(paragraphsCount, 5));

    // if (sCount == 1 && pTag) {
    //   paragraphStream.push("<p>");
    // }

    paragraphStream.push(generateSentenceForStream(endOfParagraph));

    if (endOfParagraph && !endOfStream) {
      // paragraphStream.push((pTag ? "</p>" : "") + "\n");
      paragraphStream.push(" ");
      sCount = 0;
      if (!req.query.sentences) {
        sentenceCount = randy.randInt(3, 6);
      }
      pCount++;
    }
    if (endOfParagraph && endOfStream) {
      // if (pTag) {
      //   paragraphStream.push("</p>");
      // }

      // if (pJsonFormat) {
      //   paragraphStream.push('"}');
      // }

      return paragraphStream.push(null);
    }
  };

  // if (pJsonFormat) {
  //   res.setHeader("Content-Type", "application/json");
  // } else {
  //   res.setHeader("Content-Type", "text/plain");
  // }

  res.setHeader("Content-Type", "text/plain");

  paragraphStream.pipe(res);
  return await res.status(200);
}
  
function constrain(input, max) {
  return Math.min(input, max);
}

function generate(numberOfSentences) {
  var sentences = "";
  for(var i = 0; i < numberOfSentences; i++) {
    sentences += capitalizeFirstLetter( randomStartingPhrase() + makeSentenceFromTemplate()) + ".";
    sentences += (numberOfSentences > 1) ? " " : "";
  }
  return sentences;
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