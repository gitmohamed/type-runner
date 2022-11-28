const GenerateParagraph = (paragraphCount) => {
    try {
        return fetch(`/api/paragraphs?paragraphs=${paragraphCount}`)
        .then((data) => {
            return data.text();
        }).then((text) => {
            return text;
        })
    } catch (error) {
        console.error(error)
        return error;
    }
}

export default GenerateParagraph