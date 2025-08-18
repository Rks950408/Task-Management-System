// Task Management System - Frontend Application
// This will trigger GitHub Actions deployment
"use client"

import { useState, useEffect } from "react"
import AuthForms from "../components/AuthForms"
import MainApp from "../components/MainApp"
import LoadingSpinner from "../components/LoadingSpinner"
import Toast from "../components/Toast"

const API_BASE_URL = "http://localhost:8000"

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = () => {
    const savedToken = localStorage.getItem("authToken")
    const savedUser = localStorage.getItem("currentUser")

    if (savedToken && savedUser) {
      setAuthToken(savedToken)
      setCurrentUser(JSON.parse(savedUser))
      loadTasks(savedToken)
    }
  }

  const showToast = (message, type = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const handleLogin = async (username, password) => {
    setLoading(true)

    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    try {
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.access_token

        const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (userResponse.ok) {
          const user = await userResponse.json()
          setAuthToken(token)
          setCurrentUser(user)
          localStorage.setItem("authToken", token)
          localStorage.setItem("currentUser", JSON.stringify(user))

          loadTasks(token)
          showToast("Login successful!", "success")
        }
      } else {
        const error = await response.json()
        showToast(error.detail || "Login failed", "error")
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (username, email, password) => {
    setLoading(true)

    const userData = { username, email, password }

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        showToast("Account created successfully! Please login.", "success")
        return true
      } else {
        const error = await response.json()
        showToast(error.detail || "Signup failed", "error")
        return false
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setAuthToken(null)
    setCurrentUser(null)
    setTasks([])
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    showToast("Logged out successfully", "success")
  }

  const loadTasks = async (token = authToken) => {
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const tasksData = await response.json()
        setTasks(tasksData)
      } else {
        showToast("Failed to load tasks", "error")
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskSubmit = async (taskData, taskId = null) => {
    setLoading(true)

    try {
      let response
      if (taskId) {
        response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(taskData),
        })
      } else {
        response = await fetch(`${API_BASE_URL}/tasks/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(taskData),
        })
      }

      if (response.ok) {
        showToast(taskId ? "Task updated successfully!" : "Task created successfully!", "success")
        loadTasks()
        return true
      } else {
        const error = await response.json()
        showToast(error.detail || "Operation failed", "error")
        return false
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showToast("Task deleted successfully!", "success")
        loadTasks()
      } else {
        showToast("Failed to delete task", "error")
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Task Management System</h1>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {currentUser.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentUser ? (
          <AuthForms onLogin={handleLogin} onSignup={handleSignup} loading={loading} />
        ) : (
          <MainApp tasks={tasks} onTaskSubmit={handleTaskSubmit} onDeleteTask={handleDeleteTask} loading={loading} />
        )}
      </main>

      {loading && <LoadingSpinner />}

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  )
}
