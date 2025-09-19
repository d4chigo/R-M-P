"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkUsersExist } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checkingUsers, setCheckingUsers] = useState(false)

  useEffect(() => {
    const handleRedirection = async () => {
      // Si ya terminó de cargar y no está autenticado
      if (!isLoading && !isAuthenticated) {
        setCheckingUsers(true)
        
        try {
          // Verificar si existen usuarios en el sistema
          const { usersExist } = await checkUsersExist()
          
          if (!usersExist) {
            // Si no hay usuarios, ir al setup
            router.push('/setup')
          } else {
            // Si hay usuarios, ir al login
            if (pathname !== '/login') {
              sessionStorage.setItem('redirectAfterLogin', pathname)
            }
            router.push('/login')
          }
        } catch (error) {
          console.error('Error verificando usuarios:', error)
          // En caso de error, ir al login por defecto
          router.push('/login')
        } finally {
          setCheckingUsers(false)
        }
      }
    }

    handleRedirection()
  }, [isAuthenticated, isLoading, router, pathname, checkUsersExist])

  // Mostrar loading mientras verifica autenticación o usuarios
  if (isLoading || checkingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {checkingUsers ? 'Verificando sistema...' : 'Verificando autenticación...'}
          </p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>
}

export default ProtectedRoute
