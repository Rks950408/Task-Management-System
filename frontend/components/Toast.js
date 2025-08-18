export default function Toast({ message, type }) {
  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white"
      case "error":
        return "bg-red-500 text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  return (
    <div
      className={`px-4 py-3 rounded-md shadow-lg ${getToastStyles(type)} animate-in slide-in-from-right duration-300`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
