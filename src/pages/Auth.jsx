import React, { useState } from 'react'
import restaurant from '../assets/images/outdoor.jpeg'
import logo from '../assets/images/logo.png'
import Register from '../components/auth/Register'
import Login from '../components/auth/Login'

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className='flex min-h-screen w-full'>
  

      <div className='w-1/2 relative flex items-center justify-center bg-cover'>
       
        <img className='w-full h-full object-cover' src={restaurant} alt='restaurant image' />

      
        <div className='absolute inset-0 bg-black/80'>

        </div>

        
        <blockquote className='absolute bottom-10 px-8 mb-10 text-2xl
        italic text-white'>
          "Serving Success, One Order at a Time.
          <br />
          Manage orders, tables, billing, and inventory—all from one place."
          <br />
          <span className='block mt-4 text-yellow-400'> </span>
        </blockquote>
      </div>


      <div className='w-1/2 min-h-screen bg-[#1a1a1a] p-10'>
        <div className='flex flex-col items-center gap-2'>
          <img src={logo} alt="quick-serve logo" className='h-14 w-14 border-2 rounded-full p-1' />
          <h1 className='text-lg font-semibold text-[#f5f5f5]
        tracking-wide'> Quick Serve </h1>

          <h2 className='text-4xl text-center mt-10 font-semibold
        text-yellow-400 mb-10'>
            {isRegister ? "Employee Registration" : "Employee Login"}
          </h2>

       
          <div className="w-full max-w-md">
            {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}
          </div>
          <div className='flex justify-center mt-6'>
            <p className='text-sm text-[#ababab]'>
              {isRegister ? "Already have an account?" : "Don't have an account?"}

            </p>
            <a onClick={() => setIsRegister(!isRegister)} className='text-yellow-400 font-semibold hover:underline text-sm' href='#'>
              &nbsp; &nbsp; {isRegister ? "Sign in" : "Sign up"}
            </a>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Auth
