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
          1 minute
      </label>
      <label className={'diff_option'}><input type="checkbox" 
        disabled={timerStarted ? "disabled" : false} 
        checked={difficulty === 'Medium'} 
        onChange={changeHandler} value="Medium" name="difficulty" />
        <span className={'checkmark'}></span>
          2 minutes
      </label>
      <label className={'diff_option'}><input type="checkbox" 
        disabled={timerStarted ? "disabled" : false} 
        checked={difficulty === 'Hard'} 
        onChange={changeHandler} value="Hard" name="difficulty" />
        <span className={'checkmark'}></span>
          3 minutes
      </label>
    </form>
  }

  export default Difficulty;