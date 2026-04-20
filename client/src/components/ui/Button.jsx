// src/components/ui/Button.jsx
export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  loading = false,
  className = "",
  type = "button",
  ...props
}) => {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-md font-semibold transition ${
        styles[variant]
      } disabled:opacity-50 ${
        disabled || loading ? "cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  );
};