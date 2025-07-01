import React from 'react'
import SalesRepDashboard from '../Components/SalesRepDashboard'
import FuelingHistory from '../Components/FuelingHistory'
import ProcessFueling from '../Components/ProcessFueling'
import TransactionHistory from '../Components/TransactionHistory'

function Sales() {
  return (
    <>
    <SalesRepDashboard/>
    <ProcessFueling/>
    <TransactionHistory/>
    </>
  )
}

export default Sales