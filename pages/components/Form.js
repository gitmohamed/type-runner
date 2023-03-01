import React from 'react';

import Loader from './Loader';

const Form = ({ displayText, timerStarted, startTimer, areaRef, isLoading }) => {

    const checkAgainstSampleText = (text) => {
        if (text === '') return;
        let beginIndex = 0, endIndex = text.length;

        while (beginIndex < endIndex + 1) {
          // check string indicies for mismatch
          // color the index background *GREEN for a match & *RED for mismatch
          if (displayText[beginIndex] === text[beginIndex]) {
            if (displayText[beginIndex] === ' ') {
              document.querySelector(`.charLi[value='${beginIndex}']`).style.backgroundColor = 'transparent'; // default - transparent background
            }
            // character match
            document.querySelector(`.charLi[value='${beginIndex}']`).style.color = 'rgb(70 201 75)'; // green
          } else if (text[beginIndex] !== displayText[beginIndex]) {
            // not a character match
            if (!text[beginIndex]) {
              if (displayText[beginIndex] === ' ') {
                document.querySelector(`.charLi[value='${beginIndex}']`).style.backgroundColor = 'transparent';
              }
              document.querySelector(`.charLi[value='${beginIndex}']`).style.color = 'rgba(255, 255, 255, 0.5)'; // default - grey
            } else {
              if (displayText[beginIndex] === ' ') {
                document.querySelector(`.charLi[value='${beginIndex}']`).style.backgroundColor = 'rgb(179 45 45)'; //red background
              }
              document.querySelector(`.charLi[value='${beginIndex}']`).style.color = 'rgb(179 45 45)'; // red 
            }
          }
          beginIndex++;
        }
        document.querySelectorAll(`.charLi:not([value='${areaRef.current.value.length}'])`).forEach(li => {
          li.classList.remove("current")
        });
        document.querySelector(`.charLi[value='${areaRef.current.value.length}']`).classList.add("current");
    }
      
    const calculateLineCount = (textCount) => {
        return textCount % 111;
    }

    const splitText = (text) => {
        return text.split('');
    }

    const handleKeyDown = (e) => {
        if (e.currentTarget.value.length > 1) {
            if (e.key !== 'Backspace') {
                if (calculateLineCount(e.currentTarget.value.length) === 0) {
                    document.body.querySelector('.char_table').style.top =
                    parseFloat(document.body.querySelector('.char_table').style.top.split('ch')[0]) - 1.35 + 'ch'
                }
            } else {
            // backspaced
                if (calculateLineCount(e.currentTarget.value.length) === 1) {
                    document.body.querySelector('.char_table').style.top =
                    parseFloat(document.body.querySelector('.char_table').style.top.split('ch')[0]) + 1.35 + 'ch'
                }
            }
        }
    }
    
return (
        <form className={'type_form'} action="#" onClick={(e) => areaRef.current.focus()}>
            <ul className={'char_table'} style={{ top: '0ch' }}>
            {isLoading ? <Loader /> : splitText(displayText).map((char, i) => {
                return <li className={`charLi ${i === 0 ? "current" : null}`} key={`${char}-${i}`} value={i}>{char}</li>
            })}
            </ul>
            <textarea ref={areaRef} name="areaText" className={'areaText'} cols="30" rows="10" placeholder='<--- Begin by typing here' 
                onKeyDown={handleKeyDown} onChange={(e) => {
                    if (!timerStarted) startTimer();
                    checkAgainstSampleText(e.currentTarget.value);
            }}></textarea>
        </form>
    )
}

export default Form