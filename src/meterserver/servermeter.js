import React from 'react'
import Groupmeter from './groupmeter';
import Singlegroupmeter from './singlegroupmeter';
import Ungroup from './ungroup'

function Servermeter() {
  return (
    <>
      <div >
        <Ungroup />

        <Singlegroupmeter />

      </div>


    </>
  )
}

export default Servermeter