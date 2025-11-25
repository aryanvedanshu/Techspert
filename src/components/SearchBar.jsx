import { useState } from 'react'
import { Search, X } from 'lucide-react'

const SearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onClear,
  className = "" 
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search 
          size={20} 
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? 'text-primary-600' : 'text-neutral-400'
          }`} 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none transition-all duration-200 ${
            isFocused
              ? 'border-primary-300 ring-4 ring-primary-100'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
