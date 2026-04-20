// src/components/ui/Badge.jsx
export const Badge = ({ children, variant = "gray", className = "" }) => {
  const styles = {
    gray: "bg-gray-200 text-gray-800",
    green: "bg-green-200 text-green-800",
    yellow: "bg-yellow-300 text-yellow-800",
    red: "bg-red-200 text-red-800",
    blue: "bg-blue-200 text-blue-800",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-md font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};