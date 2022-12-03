const Reset = ({ timerStarted, timer, areaRef, changeDifficulty, difficulty }) => {
    const resetHandler = () => {
        // if timer is full do not reset
        if (timer === 60000 || timer === 120000 || timer === 180000) return;
        areaRef.current.disabled = false
        changeDifficulty(difficulty) // reset timer
        areaRef.current.value = '';
    }
    return <button className={'reset_button'} disabled={timerStarted ? "disabled" : false} onClick={resetHandler}>Reset</button>
}

export default Reset;