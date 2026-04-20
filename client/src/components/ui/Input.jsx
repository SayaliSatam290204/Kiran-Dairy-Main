// src/components/ui/Input.jsx
export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold mb-2 text-gray-800">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md outline-none transition
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${className}
        `}
        {...props}
      />
    </div>
  );
};