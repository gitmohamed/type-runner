import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Watch from './components/Watch'
import Loader from './components/Loader'
import Reset from './components/Reset'
import Difficulty from './components/Difficulty'
import ResultsToggle from './components/ResultsToggle'

const Game = () => {
    const [displayText, setDisplayText] = useState('')
    const [timerStarted, setTimerStarted] = useState(false)
    const [timeInterval, setTimerInterval] = useState(0)
    const [timer, setTimer] = useState(60000) // now
    const [watch, setWatch] = useState('00 : 60')
    const [difficulty, setDifficulty] = useState('Easy')
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [score, setScore] = useState([0, 0, 0])
    const areaRef = useRef(null)
  
    const Score = () => {
        const modalRef = useRef();
        const closeModal = (e) => {
            if (e.currentTarget === modalRef.current) {
                setShowModal(false);
                document.querySelector("#portal").style.display = 'none'
            }
        };
        return ReactDOM.createPortal(
            <div className={'container'} ref={modalRef} onClick={closeModal}>
                <div className={'modal'}>
                    <button onClick={() => setShowModal(false)}>
                    <i />
                    <i />
                    </button>
                    <h2>Results:</h2>
                    Words per minute: <b style={{color: '#673ab7'}}>{score[0]}</b> <br />
                    Accuracy: <b style={{color: score[1] > 90 ? '#14bf1b' : '#ff9800'}}>{score[1]}% </b><br />
                    Total Accuracy: <b style={{color: score[2] > 55 ? '#14bf1b' : '#ff9800'}}>{score[2]}% </b><br />
                </div>
            </div>
            , document.querySelector("#portal"))
    }
  
    
  const GenerateParagraph = async (paragraphCount) => {
    try {
      setIsLoading(true)
      return await fetch(`/api/paragraphs?paragraphs=${paragraphCount}`)
      .then((data) => {
          return data.text();
      }).then((text) => {
          setDisplayText(text);
          setIsLoading(false)
      })
    } catch (error) {
        console.error(error)
        return error;
    }
  }

  const startTimer = () => {
    // create timer interval[timeInterval] and start timer
    setTimerStarted(true)
    const time = setInterval(() => {
      setTimer(timer => timer - 1000)
    }, 1000)
    setTimerInterval(time)
  }

  // on mount
  useEffect(() => {
    changeDifficulty('Easy')
  }, [])

  // watch tick - every 1000ms
  useEffect(() => {
    const charMatchCount = () => {
      return areaRef.current.value.split('').filter((char, i) => { return char === displayText[i] }).length
    }

    const calculateScore = () => {
      const wordCount = (areaRef.current.value.match(/\s/g) || []).length;
      const completionPercentage = Math.round((charMatchCount() / displayText.length) * 100);
      const accuracy = Math.round((charMatchCount() / areaRef.current.value.length) * 100)

      switch (difficulty) {
        case 'Medium':
          return [Math.round(wordCount / 2) + 1, accuracy, completionPercentage]
        case 'Hard':
          return [Math.round(wordCount / 3) + 1, accuracy, completionPercentage]
        default:
          return [Math.round(wordCount) + 1, accuracy, completionPercentage]
      }
    }
    // timer ran out!
    if (timeInterval && timer < 1) {
      setTimerStarted(false)
      areaRef.current.disabled = "disabled"
      clearInterval(timeInterval)
      setTimerInterval(0)
      setWatch(`00 : 00`)
      setScore(calculateScore())
      setShowModal(true)
      document.querySelector("#portal").style.display = 'flex'
      return;
    };
    setWatch(`0${Math.floor(timer / 1000 / 60) % 60} : ${Math.floor(timer / 1000) % 60 < 10 ? '0' : ''}${Math.floor(timer / 1000) % 60}`)
  }, [timer, timeInterval])


  const changeDifficulty = async (diff) => {
    switch (diff) {
      case 'Hard':
        setTimer(180000)
        setDifficulty('Hard')
        GenerateParagraph(4)
        break;
      case 'Medium':
        setTimer(120000)
        setDifficulty('Medium')
        GenerateParagraph(3)
        break;

      default:
        setTimer(60000)
        setDifficulty('Easy')
        GenerateParagraph(2)
        break;
    }
    areaRef.current.disabled = false
    areaRef.current.value = '';
    areaRef.current.focus();
    setScore([0, 0])
    document.querySelector('.char_table').style.left = document.querySelector('.type_form').offsetWidth/2 + 'px'
    document.querySelectorAll('.charLi').forEach(li => {
      if (li.textContent === ' ') {
        li.style.backgroundColor = 'transparent'
      }
      li.style.color = 'rgba(255, 255, 255, 0.5)'
    })
  }

  
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
    document.querySelectorAll(`.charLi:not([value='${areaRef.current.selectionEnd}'])`).forEach(li => {
        li.classList.remove("current")
    });
    document.querySelector(`.charLi[value='${areaRef.current.selectionEnd}']`).classList.add("current");
}

const calculateLineCount = (textCount) => {
    return textCount % 111;
}

const handleKeyDown = (e) => {
  if (e.currentTarget.value.length >= 0 && areaRef.current.selectionEnd > 0) {
    if(e.key === "ArrowLeft") {
      document.querySelectorAll(`.charLi:not([value='${areaRef.current.selectionEnd - 1}'])`).forEach(li => {
        li.classList.remove("current")
      });
      document.querySelector(`.charLi[value='${areaRef.current.selectionStart - 1}']`).classList.add("current");
      if(areaRef.current.selectionEnd > document.querySelector('.current').value) {
        document.body.querySelector('.char_table').style.left =
        parseFloat(document.body.querySelector('.char_table').style.left.split('px')[0]) + document.querySelector(`.char_table li:nth-of-type(${areaRef.current.value.length - 1})`).clientWidth - 0.9 + 'px'
      }
    } else if (e.key === "ArrowRight") {
      if(areaRef.current.selectionEnd > document.querySelector('.current').value) {
        document.querySelectorAll(`.charLi:not([value='${areaRef.current.selectionEnd + 1}'])`).forEach(li => {
          li.classList.remove("current")
        });
        document.querySelector(`.charLi[value='${areaRef.current.selectionStart + 1}']`).classList.add("current");
        document.body.querySelector('.char_table').style.left =
        parseFloat(document.body.querySelector('.char_table').style.left.split('px')[0]) - document.querySelector(`.char_table li:nth-of-type(${areaRef.current.value.length + 1})`).clientWidth - 0.9 + 'px'
      } else {
        document.querySelectorAll(`.charLi:not([value='${areaRef.current.selectionEnd}'])`).forEach(li => {
          li.classList.remove("current")
        });
        document.querySelector(`.charLi[value='${areaRef.current.selectionStart}']`).classList.add("current");
      }
    }
    if (e.key !== 'Backspace') {
      if(e.key.length === 1) { // if valid letter character - will return 1 for length
        document.body.querySelector('.char_table').style.left =
        parseFloat(document.body.querySelector('.char_table').style.left.split('px')[0]) - document.querySelector(`.char_table li:nth-of-type(${areaRef.current.value.length + 1})`).clientWidth - 0.9 + 'px'
      }
    } else {
    // backspaced
      document.body.querySelector('.char_table').style.left =
      parseFloat(document.body.querySelector('.char_table').style.left.split('px')[0]) + document.querySelector(`.char_table li:nth-of-type(${areaRef.current.value.length})`).clientWidth - 0.9 + 'px'
    }
  }
}
  return (
    <div className={'game'}>
        <Difficulty difficulty={difficulty} timerStarted={timerStarted} changeDifficulty={changeDifficulty} />
        <Watch currentTime={watch} />
        <Reset timerStarted={timerStarted} timer={timer} areaRef={areaRef} changeDifficulty={changeDifficulty} difficulty={difficulty} />
        {!showModal && score[0] !== 0 && <ResultsToggle setShowModal={setShowModal} />}
        <br />
        <br />
        <br />
        <form className={'type_form'} action="#" onClick={(e) => areaRef.current.focus()}>
            <ul className={'char_table'}>
                {isLoading ? <Loader /> : displayText.split('').map((char, i) => {
                    return <li className={`charLi ${i === 0 ? "current" : ""}`} key={`${char}-${i}`} value={i}>{char}</li>
                })}
            </ul>
            <textarea ref={areaRef} name="areaText" className={'areaText'} cols="30" rows="10" placeholder='<--- Begin by typing here' 
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                  document.querySelectorAll(`.charLi:not([value='${e.currentTarget.selectionEnd}'])`).forEach(li => {
                    li.classList.remove("current")
                  });
                  document.querySelector(`.charLi[value='${e.currentTarget.selectionEnd}']`).classList.add("current");
                }} 
                onBlur={(e) => {
                  document.querySelectorAll(`.charLi`).forEach(li => {
                    li.classList.remove("current")
                  });
                }}
                onChange={(e) => {
                    if (!timerStarted) startTimer();
                        checkAgainstSampleText(e.currentTarget.value);
            }}></textarea>
        </form>
        {showModal ? <Score setShowModal={setShowModal} currentScore={score} /> : null}
        <div id='portal'></div>
    </div>
  )
}

export default Game