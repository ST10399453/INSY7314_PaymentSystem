import "../FormMessages.css"

function ErrorMessage({ errors }) {
  if (!errors || errors.length === 0) return null

  return (
    <div className="field-errors">
      {errors.map((error, index) => (
        <div key={index} className="error-message">
          <span>{error}</span>
        </div>
      ))}
    </div>
  )
}

export default ErrorMessage
