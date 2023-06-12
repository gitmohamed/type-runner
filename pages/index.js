import Game from './game'

import Head from 'next/head'
// components

function Home() {
  return (
    <div id={'App'}>
      <Head>
        <title>Type Runner - Typing Speed Test</title>
        <meta name="description" content="Type Runner: Test your typing speed and accuracy with this simple typing game." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Game />
    </div>
  )
}

export default Home
