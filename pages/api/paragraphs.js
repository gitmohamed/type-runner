import { Readable } from 'stream';
import Sentencer from 'sentencer';
import randy from 'randy';

async function handler(req, res) {
  var paragraphsCount = req.query.paragraphs || 2;
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
  return await res.status(200).send(paragraphStream);
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
  
  
  // ----------------------------------------------------------------------
  //                      TEMPLATES & CONVENIENCE F()s
  // ----------------------------------------------------------------------
  
  function makeSentenceFromTemplate() {
    return Sentencer.make( randy.choice(sentenceTemplates) );
  }
  // style guide: no periods, no first capital letters.
  var sentenceTemplates = [
    "the {{ noun }} is {{ a_noun }}",
    "{{ a_noun }} is {{ an_adjective }} {{ noun }}",
    "the first {{ adjective }} {{ noun }} is, in its own way, {{ a_noun }}",
    "their {{ noun }} was, in this moment, {{ an_adjective }} {{ noun }}",
    "{{ a_noun }} is {{ a_noun }} from the right perspective",
    "the literature would have us believe that {{ an_adjective }} {{ noun }} is not but {{ a_noun }}",
    "{{ an_adjective }} {{ noun }} is {{ a_noun }} of the mind",
    "the {{ adjective }} {{ noun }} reveals itself as {{ an_adjective }} {{ noun }} to those who look",
    "authors often misinterpret the {{ noun }} as {{ an_adjective }} {{ noun }}, when in actuality it feels more like {{ an_adjective}} {{ noun }}",
    "we can assume that any instance of {{ a_noun }} can be construed as {{ an_adjective }} {{ noun }}",
    "they were lost without the {{ adjective }} {{ noun }} that composed their {{ noun }}",
    "the {{ adjective }} {{ noun }} comes from {{ an_adjective }} {{ noun }}",
    "{{ a_noun }} can hardly be considered {{ an_adjective }} {{ noun }} without also being {{ a_noun }}",
    "few can name {{ an_adjective }} {{ noun }} that isn't {{ an_adjective }} {{ noun }}",
    "some posit the {{ adjective }} {{ noun }} to be less than {{ adjective }}",
    "{{ a_noun }} of the {{ noun }} is assumed to be {{ an_adjective }} {{ noun }}",
    "{{ a_noun }} sees {{ a_noun }} as {{ an_adjective }} {{ noun }}",
    "the {{ noun }} of {{ a_noun }} becomes {{ an_adjective }} {{ noun }}",
    "{{ a_noun }} is {{ a_noun }}'s {{ noun }}",
    "{{ a_noun }} is the {{ noun }} of {{ a_noun }}",
    "{{ an_adjective }} {{ noun }}'s {{ noun }} comes with it the thought that the {{ adjective }} {{ noun }} is {{ a_noun }}",
    "{{ nouns }} are {{ adjective }} {{ nouns }}",
    "{{ adjective }} {{ nouns }} show us how {{ nouns }} can be {{ nouns }}",
    "before {{ nouns }}, {{ nouns }} were only {{ nouns }}",
    "those {{ nouns }} are nothing more than {{ nouns }}",
    "some {{ adjective }} {{ nouns }} are thought of simply as {{ nouns }}",
    "one cannot separate {{ nouns }} from {{ adjective }} {{ nouns }}",
    "the {{ nouns }} could be said to resemble {{ adjective }} {{ nouns }}",
    "{{ an_adjective }} {{ noun }} without {{ nouns }} is truly a {{ noun }} of {{ adjective }} {{ nouns }}"
  ];
  
  // partial phrases to start with. Capitalized.
  var phrases = [
    "To be more specific, ",
    "In recent years, ",
    "However, ",
    "Some assert that ",
    "If this was somewhat unclear, ",
    "Unfortunately, that is wrong; on the contrary, ",
    "This could be, or perhaps ",
    "This is not to discredit the idea that ",
    "We know that ",
    "It's an undeniable fact, really; ",
    "Framed in a different way, ",
    "What we don't know for sure is whether or not ",
    "As far as we can estimate, ",
    "The zeitgeist contends that ",
    "Though we assume the latter, ",
    "Far from the truth, ",
    "Extending this logic, ",
    "Nowhere is it disputed that ",
    "In modern times ",
    "In ancient times ",
    "Recent controversy aside, "
  ];  

  export default handler;