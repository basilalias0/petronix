import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from '../Pages/Home'
import AdminLogin from '../Components/AdminLogin'
import CustomerRegister from '../Components/CustomerRegister'
import UserProfile from '../Components/CustomerProfile'
import AdminDashboard from '../Components/AdminDashboard'
import UserManagement from '../Components/UserManagement'
import CreditManagement from '../Components/CreditManagement'
import TransactionMonitoring from '../Components/TransactionMonitoring'
import SalesRevenueAnalytics from '../Components/SalesRevenueAnalytics'
import ReportGeneration from '../Components/ReportGeneration'
import CustomerDashboard from '../Components/CustomerDashboard'
import CreditRequest from '../Components/CreditRequest'
import Payment from '../Components/Payment'
import FuelingHistory from '../Components/FuelingHistory'
import FindPetrolPumps from '../Components/FindPetrolPumps'
import Notifications from '../Components/Notifications'
import SalesRepDashboard from '../Components/SalesRepDashboard'
import ProcessFueling from '../Components/ProcessFueling'
import TransactionHistory from '../Components/TransactionHistory'
import PumpOwnerDashboard from '../Components/PumpOwnerDashboard'
import ManageSalesReps from '../Components/ManageSalesReps'
import FuelSalesTracking from '../Components/FuelSalesTracking'
import OutstandingPayments from '../Components/OutstandingPayments'
import ReportsAnalytics from '../Components/ReportsAnalytics'
import About from '../Components/About'
import Services from '../Components/Services'
import GuestLogin from '../Components/GuestLogin'
import CreditBalance from '../Components/CreditBalance'
import OwnerRegister from '../Components/OwnerRegister'
import ProtectedRoute from '../Pages/ProtectedRoute'
import ManagePumps from '../Components/ManagePumps'
import PumpApproval from '../Components/PumpApproval'
import TermsAndConditions from '../Components/TermsAndConditions'
import AdminsOwnerDetails from '../Components/AdminsOwnerDetails '
import AdminsCustomerDetails from '../Components/AdminsCustomerDetails '
import AdminsPumpsDetails from '../Components/AdminsPumpsDetails '
import AdminsCustomerCredit from '../Components/AdminsCustomerCredit'
import StripePayment from '../Pages/StripePayment'
import PaymentSuccess from '../Pages/PaymentSuccess'
import PaymentFailure from '../Pages/PaymentFailure'
import PumpSubscriptionPage from '../Pages/PumpSubscriptionPage'
import ErrorBoundary from '../Pages/ErrorBoundary '
import OwnerProfile from '../Components/OwnerProfile'


function Index() {
  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/AdminLogin' element={<AdminLogin/>}/>
    <Route path='/AdminDashboard' element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>}/>
    <Route path='/CustomerRegister' element={<CustomerRegister/>}/>
    <Route path='/UserProfile' element={<UserProfile/>}/>
    <Route path='/OwnerProfile' element={<ProtectedRoute><OwnerProfile/></ProtectedRoute>}/>
    <Route path='/UserManagement' element={<ProtectedRoute><UserManagement/></ProtectedRoute>}/>
    <Route path='/CreditManagement' element={<ProtectedRoute><CreditManagement/></ProtectedRoute>}/>
    <Route path='/PumpApproval' element={<ProtectedRoute><PumpApproval/></ProtectedRoute>}/>
    <Route path='/TransactionMonitoring' element={<ProtectedRoute><TransactionMonitoring/></ProtectedRoute>}/>
    <Route path='/SalesRevenueAnalytics' element={<ProtectedRoute><SalesRevenueAnalytics/></ProtectedRoute>}/>
    <Route path='/ReportGeneration' element={<ProtectedRoute><ReportGeneration/></ProtectedRoute>}/>
    <Route path='/CustomerDashboard' element={<ProtectedRoute><CustomerDashboard/></ProtectedRoute>}/>
    <Route path='/CreditRequest' element={<ProtectedRoute><CreditRequest/></ProtectedRoute>}/>
    <Route path='/Payment' element={<ProtectedRoute><Payment/></ProtectedRoute>}/>
    <Route path='/FuelingHistory' element={<ProtectedRoute><FuelingHistory/></ProtectedRoute>}/>
    <Route path='/FindPetrolPumps' element={<ProtectedRoute><FindPetrolPumps/></ProtectedRoute>}/>
    <Route path='/Notifications' element={<ProtectedRoute><ErrorBoundary><Notifications/></ErrorBoundary></ProtectedRoute>}/>
    <Route path='/CreditBalance' element={<ProtectedRoute><CreditBalance/></ProtectedRoute>}/>
    <Route path='/SalesRepDashboard' element={<ProtectedRoute><SalesRepDashboard/></ProtectedRoute>}/>
    <Route path='/ProcessFueling' element={<ProtectedRoute><ProcessFueling/></ProtectedRoute>}/>
    <Route path='/TransactionHistory' element={<ProtectedRoute><TransactionHistory/></ProtectedRoute>}/>
    <Route path='/PumpOwnerDashboard' element={<ProtectedRoute><PumpOwnerDashboard/></ProtectedRoute>}/>
    <Route path='/ManageSalesReps' element={<ProtectedRoute><ManageSalesReps/></ProtectedRoute>}/>
    <Route path='/FuelSalesTracking' element={<ProtectedRoute><FuelSalesTracking/></ProtectedRoute>}/>
    <Route path='/OutstandingPayments' element={<ProtectedRoute><OutstandingPayments/></ProtectedRoute>}/>
    <Route path='/ReportsAnalytics' element={<ProtectedRoute><ReportsAnalytics/></ProtectedRoute>}/>
    <Route path='/ManagePumps' element={<ProtectedRoute><ManagePumps/></ProtectedRoute>}/>
    <Route path='/About' element={<About/>}/>
    <Route path='/Services' element={<Services/>}/>
    <Route path='/Login' element={<GuestLogin/>}/>
    <Route path='/OwnerRegister' element={<OwnerRegister/>}/>
    <Route path='/TermsAndConditions' element={<TermsAndConditions/>}/>
    <Route path='/AdminsOwnerDetails/:ownerId' element={<ProtectedRoute><AdminsOwnerDetails /></ProtectedRoute>} />
    <Route path='/AdminsCustomerDetails/:customerId' element={<ProtectedRoute><AdminsCustomerDetails/></ProtectedRoute>}/>
    <Route path='/AdminsPumpsDetails/:pumpId' element={<ProtectedRoute><AdminsPumpsDetails/></ProtectedRoute>}/>
    <Route path='/AdminsCustomerCredit/:creditId' element={<ProtectedRoute><AdminsCustomerCredit/></ProtectedRoute>}/>
    <Route path='/payment/:creditId' element={<ProtectedRoute><StripePayment/></ProtectedRoute>}/>
    <Route path='/payment-success' element={<ProtectedRoute><PaymentSuccess/></ProtectedRoute>}/>
    <Route path='/payment-failure' element={<ProtectedRoute><PaymentFailure/></ProtectedRoute>}/>
    <Route path="/pump-subscription/:pumpId" element={<ProtectedRoute><PumpSubscriptionPage/></ProtectedRoute>} />

    {/* Protected Routes */}

  
   </Routes>
   </BrowserRouter>
   </>
  )
}

export default Index