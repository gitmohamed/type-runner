import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Head from 'next/head'
import Image from 'next/image'

function Home() {
  const [displayText, setDisplayText] = useState('')
  const [timerStarted, setTimerStarted] = useState(false)
  const [timeInterval, setTimerInterval] = useState(0)
  const [timer, setTimer] = useState(60000) // now
  const [watch, setWatch] = useState('00 : 60')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [difficulty, setDifficulty] = useState('Easy')
  const [showModal, setShowModal] = useState(false)
  const [score, setScore] = useState([0, 0, 0])
  const [isProduction, setIsProduction] = useState(false)
  const areaRef = useRef(null)

  const checkAgainstSampleText = (text) => {
    if (text === '') return;
    let beginIndex = 0, endIndex = displayText.length;
    while (beginIndex < endIndex) {
      // console.log(text[beginIndex], displayText[beginIndex]);
      // check string indicies for mismatch
      // color the index background *GREEN for a match & *RED for mismatch
      if (displayText[beginIndex] === text[beginIndex]) {
        if (displayText[beginIndex] === ' ') {
          document.querySelector(`.charLi[value='${beginIndex}']`).style.backgroundColor = 'transparent'; // default - transparent
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
            document.querySelector(`.charLi[value='${beginIndex}']`).style.backgroundColor = 'rgb(179 45 45)'; //red
          }
          document.querySelector(`.charLi[value='${beginIndex}']`).style.color = 'rgb(179 45 45)'; // red 
        }
      }
      beginIndex++;
    }

    document.querySelector(`.charLi[value='${currentIndex}']`).classList.add('current')
    setCurrentIndex(currentIndex => currentIndex + 1)
  }

  const GenerateParagraph = (paragraphCount) => {
    try {
        return fetch(`/api/paragraphs?paragraphs=${paragraphCount}`)
        .then((data) => {
          console.log(data)
            return data.text();
        }).then((text) => {
            setDisplayText(text);
        })
    } catch (error) {
        console.error(error)
        return error;
    }
  }

  const calculateLineCount = (textCount) => {
    return textCount % 66;
  }

  const Watch = () => {
    return <h1 className={'modal_title'}>{watch}</h1>
  }

  const splitText = (text) => {
    return text.split('');
  }

  const startTimer = () => {
    // create timer interval[timeInterval] and start timer
    setTimerStarted(true)
    const time = setInterval(() => {
      setTimer(timer => timer - 1000)
    }, 1000)
    setTimerInterval(time)
  };

  useEffect(() => {
    GenerateParagraph(difficulty === 'Easy' ? 2 : difficulty === 'Hard' ? 4 : 3)
  }, [])

  // watch tick - every 1000ms
  useEffect(() => {
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
  }, [timer])

  const Reset = () => {
    const resetHandler = () => {
      // if timer is full do not reset
      if (timer === 60000 || timer === 120000 || timer === 180000) return;
      areaRef.current.disabled = false
      changeDifficulty(difficulty) // reset timer
      areaRef.current.value = '';
    }
    return <button className={'reset_button'} disabled={timerStarted ? "disabled" : false} onClick={resetHandler}>Reset</button>
  }

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

  const Difficulty = () => {
    const changeHandler = (e) => {
      changeDifficulty(e.currentTarget.value)
    }

    return <form className={'difficulty_form'}>
      <label className={'diff_option'}><input type="checkbox" 
        disabled={timerStarted ? "disabled" : false} 
        checked={difficulty === 'Easy'} 
        onChange={changeHandler} value="Easy" name="difficulty" />
        <span className={'checkmark'}></span>
          Easy
      </label>
      <label className={'diff_option'}><input type="checkbox" 
        disabled={timerStarted ? "disabled" : false} 
        checked={difficulty === 'Medium'} 
        onChange={changeHandler} value="Medium" name="difficulty" />
        <span className={'checkmark'}></span>
          Medium
      </label>
      <label className={'diff_option'}><input type="checkbox" 
        disabled={timerStarted ? "disabled" : false} 
        checked={difficulty === 'Hard'} 
        onChange={changeHandler} value="Hard" name="difficulty" />
        <span className={'checkmark'}></span>
          Hard
      </label>
    </form>
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
          <button onClick={() => setShowModal(false)}>X</button>
          <h2>Results:</h2>
          Words per minute: <b style={{color: '#673ab7'}}>{score[0]}</b> <br />
          Accuracy: <b style={{color: score[1] > 90 ? '#14bf1b' : '#ff9800'}}>{score[1]}% </b><br />
          Total Accuracy: <b style={{color: score[2] > 55 ? '#14bf1b' : '#ff9800'}}>{score[2]}% </b><br />
        </div>
      </div>
      , document.querySelector("#portal"))
  }

  const charMatchCount = () => {
    return areaRef.current.value.split('').filter((char, i) => { return char === displayText[i] }).length
  }

  const calculateScore = () => {
    const wordCount = (areaRef.current.value.match(/\s/g) || []).length;
    const completionPercentage = Math.round((charMatchCount() / displayText.length) * 100);
    const accuracy = Math.round((charMatchCount() / areaRef.current.value.length) * 100)

    switch (difficulty) {
      case 'Medium':
        return [Math.round(wordCount / 2), accuracy, completionPercentage]
      case 'Hard':
        return [Math.round(wordCount / 3), accuracy, completionPercentage]
      default:
        return [Math.round(wordCount), accuracy, completionPercentage]
    }
  }

  const handleKeyDown = (e) => {
    if (e.currentTarget.value.length > 0) {
      if (e.key !== 'Backspace') {
        if (calculateLineCount(e.currentTarget.value.length) === 0) {
          document.body.querySelector('.char_table').style.top =
            parseFloat(document.body.querySelector('.char_table').style.top.split('ch')[0]) - 1.4 + 'ch'
        }
      } else {
        if (calculateLineCount(e.currentTarget.value.length) === 1) {
          document.body.querySelector('.char_table').style.top =
            parseFloat(document.body.querySelector('.char_table').style.top.split('ch')[0]) + 1.4 + 'ch'
        }
      }
    }
  }

  const ResultsToggle = () => {
    const toggleResults = (e) => {
      document.body.querySelector("#portal").style.display = 'flex'
      setShowModal(true)
    }
    return <a className='result_button' onClick={toggleResults}>Results</a>
  }

  return (
    <div id={'App'}>
      <Difficulty />
      <Watch />
      <Reset />
      {!showModal && score[0] !== 0 && <ResultsToggle />}
      <br />
      <br />
      <form className={'type_form'} action="#" onClick={(e) => areaRef.current.focus()}>
        <ul className={'char_table'} style={{ top: '0ch' }}>
          {splitText(displayText).map((char, i) => {
            return <li className={'charLi'} key={`${char}-${i}`} value={i}>{char}</li>
          })}
        </ul>
        <textarea ref={areaRef} name="areaText" className={'areaText'} cols="30" rows="10" placeholder='<--- Begin by typing here' 
          onKeyDown={handleKeyDown} onChange={(e) => {
          if (!timerStarted) startTimer();
          checkAgainstSampleText(e.currentTarget.value);
        }}></textarea>
      </form>
      {showModal ? <Score /> : null}
      <div id='portal'></div>
    </div>
  )
}

export default Home
