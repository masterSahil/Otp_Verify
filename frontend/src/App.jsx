import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PhoneNumberVerification from './Otp'
import OTPVerification from './components/OtpVerify'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <PhoneNumberVerification /> */}
      <OTPVerification />
    </>
  )
}

export default App
