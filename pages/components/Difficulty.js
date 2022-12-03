  const Difficulty = ({ difficulty, timerStarted, changeDifficulty }) => {
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

  export default Difficulty;