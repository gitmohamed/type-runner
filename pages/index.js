import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Head from 'next/head'
// components
import Watch from './components/Watch'
import Form from './components/Form'
import Reset from './components/Reset'
import Difficulty from './components/Difficulty'
import ResultsToggle from './components/ResultsToggle'

function Home() {
  const [displayText, setDisplayText] = useState('')
  const [timerStarted, setTimerStarted] = useState(false)
  const [timeInterval, setTimerInterval] = useState(0)
  const [timer, setTimer] = useState(60000) // now
  const [watch, setWatch] = useState('00 : 60')
  const [difficulty, setDifficulty] = useState('Easy')
  const [showModal, setShowModal] = useState(false)
  const [score, setScore] = useState([0, 0, 0])
  const [isLoading, setIsLoading] = useState(false)
  const areaRef = useRef(null)

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
  document.querySelector('.char_table').style.top = '0ch'
  document.querySelectorAll('.charLi').forEach(li => {
    if (li.textContent === ' ') {
      li.style.backgroundColor = 'transparent'
    }
    li.style.color = 'rgba(255, 255, 255, 0.5)'
  })
}
  
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

  return (
    <div id={'App'}>
      <Difficulty difficulty={difficulty} timerStarted={timerStarted} changeDifficulty={changeDifficulty} />
      <Watch currentTime={watch} />
      <Reset timerStarted={timerStarted} timer={timer} areaRef={areaRef} changeDifficulty={changeDifficulty} difficulty={difficulty} />
      {!showModal && score[0] !== 0 && <ResultsToggle setShowModal={setShowModal} />}
      <br />
      <br />
      <Form areaRef={areaRef} displayText={displayText} isLoading={isLoading} startTimer={startTimer} timerStarted={timerStarted} />
      {showModal ? <Score setShowModal={setShowModal} currentScore={score} /> : null}
      <div id='portal'></div>
    </div>
  )
}

export default Home
