import { useState } from "react";

interface SwitchProps {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "primary" | "neutral";
  className?: string;
}

const Switch = ({ label, defaultChecked = false, disabled = false, onChange, color = "primary", className = "", }: SwitchProps) => {

  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newCheckedState = e.target.checked;
    setIsChecked(newCheckedState);
    onChange?.(newCheckedState);
  };

  // Color variants
  const variants = {
    primary: {
      checked: "bg-blue-600 dark:bg-blue-500",
      unchecked: "bg-gray-200 dark:bg-gray-700",
    },
    neutral: {
      checked: "bg-gray-600 dark:bg-gray-500",
      unchecked: "bg-gray-200 dark:bg-gray-700",
    },
  };

  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
      />

      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 
          ${isChecked ? variants[color].checked : variants[color].unchecked}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 
            ${isChecked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>

      <span className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
        {label}
      </span>
    </label>
  );
};

export default Switch;