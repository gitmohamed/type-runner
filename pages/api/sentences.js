import { Readable } from 'stream';
import constrain from './utils/constrain';

function handler(req, res) {
  const num = req.query.count || 4;
  var sentenceStream = new Readable;
  var count = 0;

  sentenceStream._read = function () {
    count++;
    var last = (count === constrain(num, 12));

    sentenceStream.push(generateSentenceForStream(last));

    if (last) {
      return sentenceStream.push(null);
    }
  };

  res.setHeader("Content-Type", "text/plain");

  sentenceStream.pipe(res);
  return res.status(200);
}

export default handler;