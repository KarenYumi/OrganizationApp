import { useState, useEffect, useRef } from 'react';

const SingleSelectCombobox = ({
  options = [],
  selectedItem = '',
  onChange,
  placeholder = 'Digite ou selecione...',
  allowCreate = true,
  onCreateNew
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedItem);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);

  // Atualiza input quando selectedItem muda
  useEffect(() => {
    setInputValue(selectedItem);
  }, [selectedItem]);

  // Atualiza opções quando options muda
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Filtra as opções quando digita
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Filtra as opções
    const filtered = options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setIsOpen(true);
  };

  // Seleciona uma opção
  const selectOption = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setFilteredOptions(options);
  };

  // Cria nova opção
  const createNewOption = () => {
    const newItem = inputValue.trim();
    if (newItem && onCreateNew) {
      onCreateNew(newItem);
    }
    onChange(newItem);
    setIsOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFilteredOptions(options);
    }
  };

  // Fecha quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verifica se pode criar novo
  const canCreateNew = allowCreate && 
    inputValue.trim() && 
    !options.some(option => option.toLowerCase() === inputValue.toLowerCase());

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* INPUT */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.5rem 2.5rem 0.5rem 0.75rem',
            border: '1px solid #2f82ff',
            borderRadius: '4px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        
        {/* SETA */}
        <button
          type="button"
          onClick={toggleDropdown}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            color: '#666'
          }}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          
          {/* OPÇÃO CRIAR NOVO */}
          {canCreateNew && (
            <div
              onClick={createNewOption}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                backgroundColor: '#f0f8ff',
                borderBottom: '1px solid #eee',
                color: '#ff6b35',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>+</span>
              <span>Criar: "{inputValue.trim()}"</span>
            </div>
          )}

          {/* LISTA DE OPÇÕES */}
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => selectOption(option)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                backgroundColor: option === selectedItem ? '#e1e6f0' : 'transparent',
                color: option === selectedItem ? '#2f82ff' : '#000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = option === selectedItem ? '#e1e6f0' : 'transparent'}
            >
              <span>{option}</span>
              {option === selectedItem && (
                <span style={{ color: '#2f82ff', fontWeight: 'bold' }}>✓</span>
              )}
            </div>
          ))}

          {/* SEM RESULTADOS */}
          {filteredOptions.length === 0 && !canCreateNew && (
            <div style={{
              padding: '0.5rem 0.75rem',
              color: '#666',
              fontSize: '0.875rem'
            }}>
              Nenhum item encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SingleSelectCombobox };