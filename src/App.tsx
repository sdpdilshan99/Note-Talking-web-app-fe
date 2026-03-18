import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import { ToastContainer } from 'react-toastify'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './pages/Register'

function App() {
  return (
    <>
    <ToastContainer position='top-right' autoClose={3000}/>
    <Router>
      <AuthProvider>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute/>}>
            <Route path='/' element={<Dashboard/>}/>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
    </>
  )
}

export default App
