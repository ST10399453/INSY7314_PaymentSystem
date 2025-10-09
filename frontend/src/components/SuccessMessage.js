import "../FormMessages.css"

/**
 * Component to display success messages
 * @param {string} message - Success message to display
 */
function SuccessMessage({ message }) {
  if (!message) return null

  return (
    <div className="success-message">
      <span>{message}</span>
    </div>
  )
}

export default SuccessMessage
