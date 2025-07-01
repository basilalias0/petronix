import React from 'react'
import CustomerRegister from '../Components/CustomerRegister'
import UserProfile from '../Components/CustomerProfile'
import CustomerDashboard from '../Components/CustomerDashboard'
import CreditRequest from '../Components/CreditRequest'
import Payment from '../Components/Payment'
import FuelingHistory from '../Components/FuelingHistory'
import FindPetrolPumps from '../Components/FindPetrolPumps'
import Notifications from '../Components/Notifications'
import CreditBalance from '../Components/CreditBalance'
import TermsAndConditions from '../Components/TermsAndConditions'


function Customer() {
  return (
    <>
    <CustomerRegister/>
    <UserProfile/>
    <CustomerDashboard/>
    <CreditRequest/>
    <Payment/>
    <FuelingHistory/>
    <FindPetrolPumps/>
    <Notifications/>
    <CreditBalance/>
    <TermsAndConditions/>
    </>
  )
}

export default Customer