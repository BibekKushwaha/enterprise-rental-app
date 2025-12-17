// components/MultiSelectDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  value: string[]; // controlled array of selected values
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const toggle = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between border rounded p-3"
      >
        <div className="truncate">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <span className="text-sm">
              {options
                .filter((o) => value.includes(o.value))
                .map((o) => o.label)
                .join(", ")}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded shadow-lg max-h-52 overflow-auto">
          <ul>
            {options.map((opt) => {
              const checked = value.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggle(opt.value)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                  {checked && <Check className="w-4 h-4 text-green-600" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
