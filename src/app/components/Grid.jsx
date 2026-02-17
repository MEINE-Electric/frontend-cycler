"use client"

import React from 'react'
import Panel from './Panel'
import { useChannelStore } from '../store/store'
import cyclerWS from '../store/cyclerWS'

const Grid = () => {
  const wsData = cyclerWS();  
  return (
    <div className='grid grid-cols-3 gap-2 w-[65vw] font-sans text-sm h-screen no-scrollbar overflow-y-auto py-8'>

      <Panel label={11} />
      <Panel label={12} />
      <Panel label={21} />
      <Panel label={22} />
      <Panel label={31} />
      <Panel label={32} />      
      <Panel label={41} />
      <Panel label={42} />
      
    </div>
  )
}

export default Grid