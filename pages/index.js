
import Head from 'next/head'
// components
import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Game from './game'

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
