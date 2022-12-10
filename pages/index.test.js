import React from 'react'
import { render, fireEvent, wait } from '@testing-library/react'
import Home from './index'

test('user can type text in the textarea and see it highlighted as they type', async () => {
  const { getByTestId } = render(<Home />)
  const textarea = getByTestId('textarea')
  const sampleText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

  // simulate user typing in the textarea
  fireEvent.change(textarea, { target: { value: sampleText } })

  // assert that the text in the textarea matches the sample text
  expect(textarea.value).toBe(sampleText)

  // assert that the text in the textarea is highlighted correctly
  // as the user types
  await wait(() => {
    const highlightedText = getByTestId('highlighted-text')
    expect(highlightedText).toHaveTextContent(sampleText)
  })
})


test('GenerateParagraph makes the correct API call and receives the correct response', async () => {
    // create a mock function to simulate the API call
    const mockFetch = jest.fn()
  
    // define the expected response from the API
    const mockResponse = {
      data: {
        sentences: 5,
        paragraphs: 3,
        text: 'Lorem ipsum dolor sit amet...'
      }
    }
  
    // define the expected arguments for the API call
    const expectedArgs = {
      method: 'GET',
      body: JSON.stringify({
        paragraphs: 3
      })
    }
  
    // define the return value of the mock function
    mockFetch.mockReturnValue(Promise.resolve(mockResponse))
  
    // replace the global.fetch method with the mock function
    global.fetch = mockFetch
  
    const { getByTestId } = render(<Home />)
  
    // simulate user clicking the Generate Paragraph button
    // fireEvent.click(getSelection('generate-paragraph-button'))
  
    // assert that the mock function was called with the correct arguments
    expect(mockFetch).toHaveBeenCalledWith('/api/paragraphs', expectedArgs)
  
    // assert that the correct response was received from the API
    await wait(() => {
      const textarea = getByTestId('textarea')
      expect(textarea).toHaveTextContent(mockResponse.data.text)
    })
  })