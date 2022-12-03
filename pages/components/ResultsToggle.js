const ResultsToggle = ({ setShowModal }) => {
    const toggleResults = (e) => {
        document.body.querySelector("#portal").style.display = 'flex'
        setShowModal(true)
    }
    return <a className='result_button' onClick={toggleResults}>Results</a>
}

export default ResultsToggle;