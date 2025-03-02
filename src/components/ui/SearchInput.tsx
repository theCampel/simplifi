import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  className?: string;
  placeholder?: string;
  debounceTime?: number;
}

const SearchInput = ({
  onSearch,
  className,
  placeholder = 'Search...',
  debounceTime = 100, 
  ...props
}: SearchInputProps) => {
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  // Update local state immediately for responsive UI
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setDebouncedValue(newValue);
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(debouncedValue);
    }, debounceTime);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedValue, debounceTime, onSearch]);

  const handleClear = () => {
    setValue('');
    setDebouncedValue('');
    onSearch('');
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="w-full bg-secondary/50 border-0 pl-10 pr-10 py-2 rounded-full focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
