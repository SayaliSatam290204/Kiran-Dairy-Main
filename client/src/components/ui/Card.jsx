// src/components/ui/Card.jsx
export const Card = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>}
      {children}
    </div>
  );
};