import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Watch from './components/Watch'
import Loader from './components/Loader'
import Reset from './components/Reset'
import Difficulty from './components/Difficulty'
import ResultsToggle from './components/ResultsToggle'
import LiveScore from './components/LiveScore'

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
  const [liveScore, setLiveScore] = useState({
    wpm: 0,
    accuracy: 100,
    streak: 0,
    wordsCompleted: 0,
    perfectWords: 0,
    combo: 0
  })
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [words, setWords] = useState([])
  const [lastStreak, setLastStreak] = useState(0)
  const [completedWords, setCompletedWords] = useState(new Set())
  const [lastTypedLength, setLastTypedLength] = useState(0)
  const areaRef = useRef(null)
  const audioRef = useRef(null)

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
          Words per minute: <b style={{ color: '#673ab7' }}>{score[0]}</b> <br />
          Accuracy: <b style={{ color: score[1] > 90 ? '#14bf1b' : '#ff9800' }}>{score[1]}% </b><br />
          Total Accuracy: <b style={{ color: score[2] > 55 ? '#14bf1b' : '#ff9800' }}>{score[2]}% </b><br />
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
          // Split text into words for word-level tracking
          const wordArray = text.split(/(\s+)/).filter(word => word.trim().length > 0);
          setWords(wordArray);
          setCurrentWordIndex(0);
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

  // Word detection and scoring functions
  const findWordBoundaries = (text) => {
    const boundaries = [];
    let wordStart = 0;

    for (let i = 0; i <= text.length; i++) {
      if (i === text.length || text[i] === ' ') {
        if (i > wordStart) {
          boundaries.push({ start: wordStart, end: i - 1, word: text.slice(wordStart, i) });
        }
        wordStart = i + 1;
      }
    }
    return boundaries;
  };

  const checkWordCompletion = (typedText) => {
    const displayWords = findWordBoundaries(displayText);

    let newWordsCompleted = 0;
    let perfectWords = 0;
    let correctChars = 0;
    let streak = 0;
    let consecutiveCorrect = true;

    // Check each display word to see if it's been completed
    displayWords.forEach((displayWord, index) => {
      const wordEndPos = displayWord.end;
      const nextCharPos = wordEndPos + 1;

      // A word is completed when:
      // 1. We've typed past the word's end position
      // 2. The next character is either a space or we're at the end of text
      const hasTypedPastWord = typedText.length > wordEndPos;
      const nextCharIsSpaceOrEnd = nextCharPos >= displayText.length ||
        (typedText.length > nextCharPos && typedText[nextCharPos] === ' ');

      const isWordComplete = hasTypedPastWord && nextCharIsSpaceOrEnd;

      if (isWordComplete) {
        // Extract the typed word for this position
        const typedWord = typedText.slice(displayWord.start, wordEndPos + 1);
        const isWordPerfect = typedWord === displayWord.word;

        newWordsCompleted++;

        // Check if this word was already processed (avoid duplicate sounds)
        const wordKey = `${displayWord.start}-${displayWord.end}`;
        if (!completedWords.has(wordKey)) {
          // Mark this word as completed
          setCompletedWords(prev => new Set([...prev, wordKey]));

          if (isWordPerfect) {
            perfectWords++;
            if (consecutiveCorrect) {
              streak++;
            }
            // Trigger word completion animation and sound
            animateWordCompletion(displayWord.start, displayWord.end, true);
          } else {
            consecutiveCorrect = false;
            animateWordCompletion(displayWord.start, displayWord.end, false);
          }
        } else if (isWordPerfect) {
          // Still count perfect words for scoring, just don't animate again
          perfectWords++;
          if (consecutiveCorrect) {
            streak++;
          }
        } else {
          consecutiveCorrect = false;
        }
      }
    });

    // Calculate accuracy
    for (let i = 0; i < Math.min(typedText.length, displayText.length); i++) {
      if (typedText[i] === displayText[i]) {
        correctChars++;
      }
    }

    const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;

    // Calculate WPM based on difficulty
    let initialTime;
    switch (difficulty) {
      case 'Hard':
        initialTime = 180000;
        break;
      case 'Medium':
        initialTime = 120000;
        break;
      default:
        initialTime = 60000;
        break;
    }

    const timeElapsed = (initialTime - timer) / 1000 / 60; // in minutes
    const wpm = timeElapsed > 0 ? Math.round(newWordsCompleted / timeElapsed) : 0;

    setLiveScore(prev => ({
      ...prev,
      wpm: wpm,
      accuracy: accuracy,
      streak: streak,
      wordsCompleted: newWordsCompleted,
      perfectWords: perfectWords
    }));

    // Check for streak milestone and trigger page shake
    // if (streak >= 25 && lastStreak < 25) {
    //   triggerPageShake();
    // }
    setLastStreak(streak);
  };

  const playWordCompleteSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const triggerPageShake = () => {
    document.body.classList.add('page-shake');
    setTimeout(() => {
      document.body.classList.remove('page-shake');
    }, 1000);
  };

  const triggerCorrectShake = () => {
    document.body.classList.add('correct-shake');
    setTimeout(() => {
      document.body.classList.remove('correct-shake');
    }, 400);
  };

  const triggerIncorrectShake = () => {
    document.body.classList.add('incorrect-shake');
    setTimeout(() => {
      document.body.classList.remove('incorrect-shake');
    }, 400);
  };

  const animateWordCompletion = (startIndex, endIndex, isPerfect) => {
    // Play success sound and trigger shake for perfect words
    if (isPerfect) {
      playWordCompleteSound();
      triggerCorrectShake();
    } else {
      triggerIncorrectShake();
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const charElement = document.querySelector(`.charLi[value='${i}']`);
      if (charElement) {
        charElement.classList.add(isPerfect ? 'word-perfect' : 'word-completed');

        // Remove animation class after animation completes
        setTimeout(() => {
          charElement.classList.remove('word-perfect', 'word-completed');
        }, isPerfect ? 800 : 600);
      }
    }
  };

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
    // Reset live score and completed words tracking
    setLiveScore({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      wordsCompleted: 0,
      perfectWords: 0,
      combo: 0
    })
    setCompletedWords(new Set())
    setLastTypedLength(0)
    document.querySelector('.char_table').style.left = document.querySelector('.type_form').offsetWidth / 2 + 'px'
    document.querySelectorAll('.charLi').forEach(li => {
      if (li.textContent === ' ') {
        li.style.backgroundColor = 'transparent'
      }
      li.style.color = 'rgba(255, 255, 255, 0.5)'
    })
  }


  const checkAgainstSampleText = (text) => {
    if (text === '') {
      setLastTypedLength(0);
      return;
    }

    let beginIndex = 0, endIndex = text.length;
    let newIncorrectChar = false;

    // Check if a new character was typed and if it's incorrect
    if (text.length > lastTypedLength) {
      const newCharIndex = text.length - 1;
      if (displayText[newCharIndex] && text[newCharIndex] !== displayText[newCharIndex]) {
        newIncorrectChar = true;
      }
    }

    // Trigger shake for new incorrect character
    if (newIncorrectChar) {
      triggerIncorrectShake();
    }

    // Update the last typed length
    setLastTypedLength(text.length);

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
      if (e.key === "ArrowLeft") {
        document.querySelectorAll(`.charLi:not([value='${areaRef.current.selectionEnd - 1}'])`).forEach(li => {
          li.classList.remove("current")
        });
        document.querySelector(`.charLi[value='${areaRef.current.selectionStart - 1}']`).classList.add("current");
        if (areaRef.current.selectionEnd > document.querySelector('.current').value) {
          document.body.querySelector('.char_table').style.left =
            parseFloat(document.body.querySelector('.char_table').style.left.split('px')[0]) + document.querySelector(`.char_table li:nth-of-type(${areaRef.current.value.length - 1})`).clientWidth - 0.9 + 'px'
        }
      } else if (e.key === "ArrowRight") {
        if (areaRef.current.selectionEnd > document.querySelector('.current').value) {
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
        if (e.key.length === 1) { // if valid letter character - will return 1 for length
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
      <LiveScore liveScore={liveScore} timerStarted={timerStarted || timer === 0} />
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
            checkWordCompletion(e.currentTarget.value);
          }}></textarea>
      </form>
      {showModal ? <Score setShowModal={setShowModal} currentScore={score} /> : null}
      <audio
        ref={audioRef}
        preload="auto"
        src="/short-success-sound-glockenspiel-treasure-video-game-6346.mp3"
      />
      <div id='portal'></div>
    </div>
  )
}

export default Game