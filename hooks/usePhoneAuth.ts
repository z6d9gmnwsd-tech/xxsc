'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  nickname: string
  phone: string
}

export function usePhoneAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const userId = localStorage.getItem('user_id')
    const nickname = localStorage.getItem('nickname')
    const phone = localStorage.getItem('phone')

    if (userId && nickname && phone) {
      setUser({ id: userId, nickname, phone })
    }
    setLoading(false)
  }

  const login = (userData: User) => {
    localStorage.setItem('user_id', userData.id)
    localStorage.setItem('nickname', userData.nickname)
    localStorage.setItem('phone', userData.phone)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('nickname')
    localStorage.removeItem('phone')
    setUser(null)
  }

  return { user, loading, login, logout, checkAuth }
}
