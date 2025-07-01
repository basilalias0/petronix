import React from 'react'
import PumpOwnerDashboard from '../Components/PumpOwnerDashboard'
import ManageSalesReps from '../Components/ManageSalesReps'
import FuelSalesTracking from '../Components/FuelSalesTracking'
import OutstandingPayments from '../Components/OutstandingPayments'
import ReportsAnalytics from '../Components/ReportsAnalytics'
import OwnerRegister from '../Components/OwnerRegister'
import ManagePumps from '../Components/ManagePumps'
import OwnerProfile from '../Components/OwnerProfile'

function Owner() {
  return (
   <>
   <PumpOwnerDashboard/>
   <ManageSalesReps/>
   <FuelSalesTracking/>
   <OutstandingPayments/>
   <ReportsAnalytics/>
   <OwnerRegister/>
   <ManagePumps/>
   <OwnerProfile/>
   
   </>
  )
}

export default Owner