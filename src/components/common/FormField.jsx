// src/components/common/FormField.jsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  className = '',
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 text-gray-900'
            }
          `}
          {...props}
        />
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;