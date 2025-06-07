import { useState, useEffect, useRef } from 'react';

const SingleSelectCombobox = ({
  options = [],
  selectedItem = '',
  onChange,
  placeholder = 'Digite ou selecione...',
  allowCreate = true,
  createText = 'Criar novo',
  noResultsText = 'Nenhum item encontrado',
  className = '',
  onCreateNew,
  searchKey = null,
  displayKey = null,
  caseSensitive = false,
  maxHeight = '15rem'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // CORRIGIDO: Referências para controle do foco
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Atualiza o input quando selectedItem muda
  useEffect(() => {
    if (selectedItem && !isOpen) {
      setInputValue(getDisplayText(selectedItem));
    }
  }, [selectedItem, isOpen]);

  // Função para obter o texto que será exibido
  const getDisplayText = (item) => {
    if (typeof item === 'string') return item;
    if (displayKey && typeof item === 'object') return item[displayKey];
    return String(item);
  };

  // Função para obter o texto usado na busca
  const getSearchText = (item) => {
    if (typeof item === 'string') return item;
    if (searchKey && typeof item === 'object') return item[searchKey];
    return getDisplayText(item);
  };

  // CORRIGIDO: Função para filtrar as opções
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const filtered = options.filter(item => {
      const searchText = getSearchText(item);
      const comparison = caseSensitive
        ? searchText.includes(newValue)
        : searchText.toLowerCase().includes(newValue.toLowerCase());
      return comparison;
    });

    setFilteredOptions(filtered);
    setFocusedIndex(-1);
    setIsOpen(true);
  };

  // CORRIGIDO: Função para lidar com as teclas
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (isOpen) {
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          selectOption(filteredOptions[focusedIndex]);
        } else if (isNewOption) {
          createNewOption();
        } else if (filteredOptions.length > 0) {
          selectOption(filteredOptions[0]);
        }
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue(getDisplayText(selectedItem));
      setFocusedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const maxIndex = filteredOptions.length + (isNewOption ? 0 : -1);
        setFocusedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        const maxIndex = filteredOptions.length + (isNewOption ? 0 : -1);
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
      }
    }
  };

  // Função para selecionar uma opção
  const selectOption = (option) => {
    const displayText = getDisplayText(option);
    setInputValue(displayText);
    onChange(option);
    setIsOpen(false);
    setFocusedIndex(-1);
    setFilteredOptions(options);
  };

  // Função para criar um novo item
  const createNewOption = () => {
    setIsOpen(false);
    
    const newItem = inputValue.trim();
    if (newItem) {
      if (onCreateNew && typeof onCreateNew === 'function') {
        onCreateNew(newItem);
      }
      onChange(newItem);
      setInputValue(newItem);
    }
    setFocusedIndex(-1);
  };

  // Função para limpar seleção
  const clearSelection = () => {
    setInputValue('');
    onChange('');
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  // Verifica se é uma nova opção
  const isNewOption = inputValue.trim() && allowCreate &&
    !options.some(item => getDisplayText(item) === inputValue.trim()) &&
    getDisplayText(selectedItem) !== inputValue.trim();

  // CORRIGIDO: Função para lidar com o blur
  const handleBlur = (e) => {
    // Verifica se o clique foi dentro do container
    if (containerRef.current && containerRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
      // Se não selecionou nada válido, volta para o valor original
      if (!selectedItem) {
        setInputValue('');
      } else {
        setInputValue(getDisplayText(selectedItem));
      }
    }, 150);
  };

  // CORRIGIDO: Função para lidar com o foco
  const handleFocus = () => {
    setIsOpen(true);
    // Mantém o valor atual para facilitar a edição
    if (!inputValue && selectedItem) {
      setInputValue(getDisplayText(selectedItem));
    }
  };

  // CORRIGIDO: Função para toggle do dropdown
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  // CORRIGIDO: Função para clique na opção
  const handleOptionClick = (option, e) => {
    e.preventDefault();
    e.stopPropagation();
    selectOption(option);
  };

  // CORRIGIDO: Função para clique na opção de criar
  const handleCreateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    createNewOption();
  };

  // Estilos CSS inline
  const containerStyle = {
    position: 'relative'
  };

  const inputContainerStyle = {
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 4rem 0.5rem 0.75rem',
    border: '1px solid #2f82ff',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none'
  };

  const buttonContainerStyle = {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '0.25rem'
  };

  const clearButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  };

  const chevronButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    transition: 'color 0.2s'
  };

  const dropdownStyle = {
    position: 'absolute',
    zIndex: 1000,
    width: '100%',
    marginTop: '0.25rem',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxHeight: maxHeight,
    overflowY: 'auto'
  };

  const createOptionStyle = {
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ff6b35',
    backgroundColor: focusedIndex === -1 ? '#f0f8ff' : 'transparent'
  };

  const optionStyle = (index) => ({
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: focusedIndex === index ? '#f5f5f5' : 'transparent'
  });

  const selectedOptionStyle = {
    backgroundColor: '#e1e6f0',
    color: '#2f82ff'
  };

  const noResultsStyle = {
    padding: '0.5rem 0.75rem',
    color: '#666',
    fontSize: '0.875rem'
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Input principal */}
      <div style={inputContainerStyle}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={inputStyle}
          className={className}
          autoComplete="off"
        />
        <div style={buttonContainerStyle}>
          {/* Botão para limpar */}
          {selectedItem && (
            <button
              type="button"
              onClick={clearSelection}
              style={clearButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              title="Limpar seleção"
            >
              ×
            </button>
          )}
          {/* Botão dropdown */}
          <button
            type="button"
            onClick={toggleDropdown}
            style={chevronButtonStyle}
            onMouseEnter={(e) => e.target.style.color = '#333'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyle}>
          {/* Opção para criar novo item */}
          {isNewOption && (
            <div
              onClick={handleCreateClick}
              style={createOptionStyle}
              onMouseEnter={(e) => {
                setFocusedIndex(-1);
                e.target.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = focusedIndex === -1 ? '#f0f8ff' : 'transparent';
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
              <span>{createText}: "{inputValue.trim()}"</span>
            </div>
          )}

          {/* Lista de opções filtradas */}
          {filteredOptions.map((option, index) => {
            const displayText = getDisplayText(option);
            const isSelected = getDisplayText(selectedItem) === displayText;
            const isFocused = focusedIndex === index;

            return (
              <div
                key={index}
                onClick={(e) => handleOptionClick(option, e)}
                style={{
                  ...optionStyle(index),
                  ...(isSelected ? selectedOptionStyle : {}),
                  ...(isFocused ? { backgroundColor: '#f5f5f5' } : {})
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span>{displayText}</span>
                {isSelected && <span style={{ color: '#2f82ff', fontWeight: 'bold' }}>✓</span>}
              </div>
            );
          })}

          {/* Mensagem quando não há resultados */}
          {filteredOptions.length === 0 && !isNewOption && (
            <div style={noResultsStyle}>
              {noResultsText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SingleSelectCombobox };