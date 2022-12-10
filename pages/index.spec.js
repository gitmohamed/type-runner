import { render, fireEvent, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Home from './index';

test('GenerateParagraph makes a GET request to retrieve a paragraph of text', async () => {
  // mock the fetch method to return a successful response
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      text: () => Promise.resolve('This is a paragraph of text'),
    })
  );

  // render the component
  const { getByTestId } = render(<Home />);

  // simulate a user clicking the button to generate a paragraph of text
  fireEvent.click(getByTestId('generate-button'));

  // wait for the component to update
  await wait(() => expect(getByTestId('text-display')).toHaveTextContent('This is a paragraph of text'));

  // ensure that the fetch method was called with the correct arguments
  expect(global.fetch).toHaveBeenCalledWith('/api/paragraphs?paragraphs=1');

  // ensure that the setDisplayText method was called with the correct value
  expect(setDisplayText).toHaveBeenLastCalledWith('This is a paragraph of text');
});