import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/store'
import socketService from './services/socket'
import { useEffect } from 'react'

import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Board from './components/Board'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/" />
}

function App() {
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token)
    }
    return () => socketService.disconnect()
  }, [isAuthenticated, token])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A3E',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#26DE81',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF6B6B',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/board/:id" element={<PrivateRoute><Board /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App