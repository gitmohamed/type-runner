import Sentencer from 'sentencer'
import randy from 'randy';
import sentenceTemplates from './sentenceTemplates';

export default function makeSentenceFromTemplate() {
    return Sentencer.make( randy.choice(sentenceTemplates) );
}
  