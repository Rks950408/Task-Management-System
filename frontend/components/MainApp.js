"use client"

import { useState, useMemo } from "react"
import TaskModal from "./TaskModal"
import TaskCard from "./TaskCard"

export default function MainApp({ tasks, onTaskSubmit, onDeleteTask, loading }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchFilter, setSearchFilter] = useState("")

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)),
      )
    }

    return filtered
  }, [tasks, statusFilter, searchFilter])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskSubmit = async (taskData) => {
    const success = await onTaskSubmit(taskData, editingTask?.id)
    if (success) {
      handleCloseModal()
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add New Task
          </button>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <input
              type="text"
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 sm:min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {tasks.length === 0
                ? "Create your first task to get started!"
                : "Try adjusting your filters to see more tasks."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={onDeleteTask} />
          ))
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal task={editingTask} onSubmit={handleTaskSubmit} onClose={handleCloseModal} loading={loading} />
      )}
    </div>
  )
}
