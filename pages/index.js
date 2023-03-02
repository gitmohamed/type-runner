import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Game from './game'

import Head from 'next/head'
// components

function Home() {
  return (
    <div id={'App'}>
      <Head>
        <title>Type Runner - Typing Speed Test</title>
        <meta name="description" content="Type Runner is a typing speed test that allows you to test your typing speed and accuracy. It also allows you to compare your typing speed with other users." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Game />
    </div>
  )
}

export default Home
