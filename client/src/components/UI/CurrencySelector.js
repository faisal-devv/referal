import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencySelector = ({ variant = 'light' }) => {
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const current = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const isDark = variant === 'dark';

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.symbol && c.symbol.toLowerCase().includes(q))
    );
  }, [query, CURRENCIES]);

  const handleSelect = (code) => {
    setCurrency(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search currency or code…"
                className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No currencies found</p>
            )}
            {filtered.map(c => <CurrencyRow key={c.code} c={c} selected={c.code === currency} onSelect={handleSelect} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const CurrencyRow = ({ c, selected, onSelect }) => (
  <button
    onClick={() => onSelect(c.code)}
    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
      selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    <span className="text-base leading-none w-6 text-center flex-shrink-0">{c.flag}</span>
    <span className={`font-semibold w-10 flex-shrink-0 ${selected ? 'text-blue-700' : 'text-gray-900'}`}>{c.code}</span>
    <span className="text-gray-500 truncate text-xs">{c.name}</span>
    {selected && <span className="ml-auto text-blue-600 text-xs flex-shrink-0">✓</span>}
  </button>
);

export default CurrencySelector;
