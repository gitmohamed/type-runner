import { useRef } from 'react'
import ReactDOM from 'react-dom'

const Score = ({ setShowModal, currentScore }) => {
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
            Words per minute: <b style={{color: '#673ab7'}}>{currentScore[0]}</b> <br />
            Accuracy: <b style={{color: currentScore[1] > 90 ? '#14bf1b' : '#ff9800'}}>{currentScore[1]}% </b><br />
            Total Accuracy: <b style={{color: currentScore[2] > 55 ? '#14bf1b' : '#ff9800'}}>{currentScore[2]}% </b><br />
        </div>
        </div>
        , document.querySelector("#portal"))
}

  export default Score;