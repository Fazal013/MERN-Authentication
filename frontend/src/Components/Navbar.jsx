import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/AppContext'
import { useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

function Navbar() {
  const [sticky,setSticky]=useState(false)
  useEffect(()=>{
    const handleScroll=()=>{
      if(window.scrollY>0){
        setSticky(true)
      }
      else{
        setSticky(false)
      }
    }
    window.addEventListener("scroll",handleScroll)
    return (()=>{
      window.removeEventListener("scroll",handleScroll)
    })
  },[]);
  const navItems= (<>
    <li><a>Home</a></li>
        <li><a>For Women</a></li>
        <li><a>For Men</a></li>
        <li><a>Contact Us</a></li>
        <li><a>About Us</a></li>
        <li><a>Refund Policy</a></li>
        <li><a>Shipping Policy</a></li>
        
  </>)

  const navigate = useNavigate();
  const {userData,backendUrl,setUserData,setIsLoggedIn} = useContext(AppContext)
  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true

      const {data} = await axios.post(backendUrl + "/api/auth/send-verify-otp")
      if (data.success) {
        
        navigate("/email-verify")
        toast.success(data.message)

      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || "An error occurred")
    }
  }

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true
      const {data} = await axios.post(backendUrl + "/api/auth/logout")
      data.success && setIsLoggedIn(false)
      data.success && setUserData(false)
      navigate("/")
    } catch (error) {
      toast.error(error.message || "An error occurred")
      
    }
  }  

  return (
    <>
    <div className={`backdrop-filter backdrop-blur z-10 max-w-screen-2xl container mx-auto md:px-20 px-4  fixed top-0 left-0 right-0 ${sticky?"sticky-navbar shadow-md text-yellow-500 duration-300 trasnition-all ease-in-out":""}`}>
    <div className="navbar">
  <div className="navbar-start cursor-pointer ">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
        {navItems}
      </ul>
    </div>
    
    <div className='hidden md:block'>
    <a href='/home'><img src={'logolance.png'} width={80} height={80} className="cursor-pointer mt-2" /></a>
    </div>
    <div className=' block md:hidden ml-5'>
      <p>Thread Lance</p>
    </div>
    <a className="text-3xl ml-6 hidden md:block">Thread-Lance </a>
  </div>
  <div className="navbar-center hidden lg:flex">
    <ul className="menu menu-horizontal px-1 text-lg">
    {navItems}
    </ul> 
  </div>
  {userData ? 
  <div className='w-16 h-10 flex justify-center items-center rounded-full bg-black text-white cursor-pointer relative group'>
    {userData.name[0].toUpperCase()}
    <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
    <ul className='list-none m-0 p-2 bg-gray-100 text-sm rounded-xl'>
      {!userData.isAccountVerified &&
      <li onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer rounded-full'>Verify Email</li>}

      <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10 rounded-full'>Logout</li>
    </ul>
    </div>
  </div> 
  :  <button onClick={()=>navigate("/login")} className='ml-20 flex items-center gap-3 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-400 trannsition-all'>Login <i class="fa-solid fa-arrow-up-right-from-square"></i></button>
 }
</div>
    </div>
    </>
  )
}

export default Navbar
