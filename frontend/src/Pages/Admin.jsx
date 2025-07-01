import React from 'react'
import AdminLogin from '../Components/AdminLogin'
import AdminDashboard from '../Components/AdminDashboard'
import UserManagement from '../Components/UserManagement'
import CreditManagement from '../Components/CreditManagement'
import TransactionMonitoring from '../Components/TransactionMonitoring'
import SalesRevenueAnalytics from '../Components/SalesRevenueAnalytics'
import ReportGeneration from '../Components/ReportGeneration'
import PumpApproval from '../Components/PumpApproval'
import AdminsOwnerDetails from '../Components/AdminsOwnerDetails '
import AdminsCustomerDetails from '../Components/AdminsCustomerDetails '
import AdminsPumpsDetails from '../Components/AdminsPumpsDetails '
import AdminsCustomerCredit from '../Components/AdminsCustomerCredit'

function Admin() {
  return (
   <>
   <AdminLogin/>
   <AdminDashboard/>
   <UserManagement/>
   <CreditManagement/>
   <TransactionMonitoring/>
   <SalesRevenueAnalytics/>
   <ReportGeneration/>
   <PumpApproval/>
   <AdminsOwnerDetails/>
   <AdminsCustomerDetails/>
   <AdminsPumpsDetails/>
   <AdminsCustomerCredit/>
  
   </>
  )
}

export default Admin