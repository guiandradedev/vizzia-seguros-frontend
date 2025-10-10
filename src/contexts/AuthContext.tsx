import api from '@/lib/axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, saveTokenLocal, logout as logoutService, saveTokenSession, getToken } from '@/services/auth'
import type { ResponseAdapter } from '@/types/api'
import type { UserToken } from '@/types/auth'
import axios, { type AxiosResponse } from 'axios'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { router } from '@/router'

export type TypeUserRoles = 'USER' | 'ADMIN'

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  cnh: string;
  expedition_cnh_date: number
  phone_id: string;
  birthday_date: Date;
  status: boolean;
}

type LoginProps = {
  email: string,
  password: string
}
export interface AuthContextProps {
  isAuthenticated: boolean
  user: User | null
  login: (data: LoginProps, remember: boolean) => Promise<void>
  logout: () => void;
  googleAuth: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Restore auth state on app load
  useEffect(() => {
    async function getUser() {
      const token = getToken(ACCESS_TOKEN_KEY)
      if (token) {
        setIsAuthenticated(true)
        setIsLoading(false)
        try {
          const response: AxiosResponse<User> = await api.get('/users/me')
          setUser(response.data)
        } catch (err) {
          console.log(err)
          logout()
        }
      } else {
        setIsLoading(false)
      }
    }
    getUser()

  }, [])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  function persistLogin(response: AxiosResponse<UserToken>, remember: boolean) {
    const accessToken = response.data.accessToken
    const refreshToken = response.data.refreshToken

    console.log(response.data)

    setIsAuthenticated(true)
    if (remember) {
      saveTokenLocal(ACCESS_TOKEN_KEY, accessToken)
      saveTokenLocal(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      saveTokenSession(ACCESS_TOKEN_KEY, accessToken)
    }
  }

  const googleAuth = async (token: string) => {
    try {
      const response: AxiosResponse<UserToken> = await api.post('/auth/social-login', {
        token: token,
        provider: 'Google',
      })
      // Em autenticacao via google, considera que vai persistir
      persistLogin(response, true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error
      } else {
        console.error('Erro inesperado:', error)
      }
    }
  }
  const login = async ({ email, password }: LoginProps, remember: boolean) => {
    try {
      const response: AxiosResponse<UserToken> = await api.post('/auth/login', {
        email: email,
        password: password
      })

      persistLogin(response, remember)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error
      } else {
        console.error('Erro inesperado:', error)
      }
    }
  }

  function logout(){
    setUser(null)
    setIsAuthenticated(false)

    logoutService()

    try {
      router.navigate({ to: "/" })
    } catch(err) {
      console.log("Falha ao navegar", err)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, googleAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
