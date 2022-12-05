import { Readable } from 'stream';
import randy from 'randy';
import generateSentenceForStream from './utils/generateSentenceStream'
import constrain from './utils/constrain'

async function handler(req, res) {
  var paragraphsCount = req.query.paragraphs || 1;
  var sentenceCount = req.query.sentences || randy.randInt(3, 6);
  var paragraphStream = new Readable;
  var pCount = 1;
  var sCount = 0;
  
  var loopCount = 0;

  paragraphStream._read = function () {
    sCount++;
    loopCount++;

    var endOfParagraph = (sCount === constrain(sentenceCount, 5));
    var endOfStream = (pCount === constrain(paragraphsCount, 5));

    paragraphStream.push(generateSentenceForStream(endOfParagraph));

    if (endOfParagraph && !endOfStream) {
      paragraphStream.push(" ");
      sCount = 0;
      if (!req.query.sentences) {
        sentenceCount = randy.randInt(3, 6);
      }
      pCount++;
    }
    if (endOfParagraph && endOfStream) {
      return paragraphStream.push(null);
    }
  };

  res.setHeader("Content-Type", "text/plain");

  paragraphStream.pipe(res);
  return await res.status(200);
}

export default handler;