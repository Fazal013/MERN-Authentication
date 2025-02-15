import { createContext } from "react";
import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useEffect } from 'react'



export const AppContext = createContext()

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true

    const backendUrl = "https://mern-authentication-hkzv.onrender.com"
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)


    const getAuthState = async () => {
        try {
            const {data}  = await axios.get(backendUrl + "/api/auth/is-auth")
            if (data.success) {
                setIsLoggedIn(true)
                getUserData()
            } else {
                setIsLoggedIn(false)
            }

        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message)
            } else {
                // Fallback to error message if it's not an axios error
                toast.error(error.message || 'An error occurred')
            }
            
        }
    }


    const getUserData  = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/data")
            data.success ? setUserData(data.userData) : toast.error(data.message)
        }catch(error){
            if (error.response && error.response.data) {
                  toast.error(error.response.data.message)
                }else {
                  // Fallback to error message if it's not an axios error
                  toast.error(error.message || 'An error occurred')
                }
        }
    }


    useEffect(() => {
        getAuthState()
    }, [])

    const value = {

        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData

    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
