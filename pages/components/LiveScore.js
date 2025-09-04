const LiveScore = ({ liveScore, timerStarted }) => {
    if (!timerStarted) return null;
    
    return (
        <div className="live-score-panel">
            <div className="score-item">
                <span className="score-label">WPM</span>
                <span className="score-value">{liveScore.wpm}</span>
            </div>
            <div className="score-item">
                <span className="score-label">Accuracy</span>
                <span className="score-value">{liveScore.accuracy}%</span>
            </div>
            <div className="score-item">
                <span className="score-label">Streak</span>
                <span className="score-value streak">{liveScore.streak}</span>
            </div>
            <div className="score-item">
                <span className="score-label">Words</span>
                <span className="score-value">{liveScore.wordsCompleted}</span>
            </div>
        </div>
    );
};

export default LiveScore;