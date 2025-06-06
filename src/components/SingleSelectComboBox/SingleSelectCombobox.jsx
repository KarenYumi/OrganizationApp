import { useState, useEffect } from 'react';

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

  // Função para filtrar as opções conforme o usuário digita
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
    setIsOpen(true);
  };

  // Função para lidar com as teclas pressionadas
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (isOpen) {
        if (filteredOptions.length > 0) {
          selectOption(filteredOptions[0]);
        } else if (isNewOption) {
          createNewOption();
        }
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue(getDisplayText(selectedItem));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  // Função para selecionar uma opção
  const selectOption = (option) => {
    const displayText = getDisplayText(option);
    setInputValue(displayText);
    onChange(option); // Passa o item selecionado
    setIsOpen(false);
    setFilteredOptions(options);
  };

  // Função para criar um novo item
  const createNewOption = () => {
    setIsOpen(false);
    
    const newItem = inputValue.trim();
    if (newItem) {
      if (onCreateNew && typeof onCreateNew === 'function') {
        onCreateNew(newItem);
        // Seleciona automaticamente o item criado
        onChange(newItem);
      } else {
        onChange(newItem);
      }
      setInputValue(newItem);
    }
  };

  // Função para limpar seleção
  const clearSelection = () => {
    setInputValue('');
    onChange('');
  };

  // Verifica se é uma nova opção
  const isNewOption = inputValue.trim() && allowCreate &&
    !options.some(item => getDisplayText(item) === inputValue.trim()) &&
    getDisplayText(selectedItem) !== inputValue.trim();

  // Função para lidar com o blur (perda de foco)
  const handleBlur = (e) => {
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('[data-dropdown]')) {
      setTimeout(() => {
        setIsOpen(false);
        // Se não selecionou nada válido, volta para o valor original
        if (!selectedItem) {
          setInputValue('');
        } else {
          setInputValue(getDisplayText(selectedItem));
        }
      }, 150);
    }
  };

  // Função para lidar com o foco
  const handleFocus = () => {
    setIsOpen(true);
    // Limpa o input para facilitar a busca
    setInputValue('');
  };

  // Funções para os efeitos hover
  const handleClearButtonMouseOver = (e) => {
    e.target.style.backgroundColor = '#f0f0f0';
  };

  const handleClearButtonMouseOut = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  const handleCreateOptionMouseOver = (e) => {
    e.target.style.backgroundColor = '#f0f8ff';
  };

  const handleCreateOptionMouseOut = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  const handleOptionMouseOver = (e, isSelected) => {
    if (!isSelected) {
      e.target.style.backgroundColor = '#f5f5f5';
    }
  };

  const handleOptionMouseOut = (e, isSelected) => {
    if (!isSelected) {
      e.target.style.backgroundColor = 'transparent';
    }
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
    fontFamily: 'inherit'
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
    fontSize: '16px'
  };

  const chevronButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const dropdownStyle = {
    position: 'absolute',
    zIndex: 10,
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
    color: '#ff6b35'
  };

  const optionStyle = {
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

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
    <div style={containerStyle}>
      {/* Input principal */}
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={inputStyle}
          className={className}
        />
        <div style={buttonContainerStyle}>
          {/* Botão para limpar */}
          {selectedItem && (
            <button
              type="button"
              onClick={clearSelection}
              style={clearButtonStyle}
              onMouseOver={handleClearButtonMouseOver}
              onMouseOut={handleClearButtonMouseOut}
              title="Limpar seleção"
            >
              ×
            </button>
          )}
          {/* Botão dropdown */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={chevronButtonStyle}
          >
            ▼
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div data-dropdown style={dropdownStyle}>
          {/* Opção para criar novo item */}
          {isNewOption && (
            <div
              onClick={createNewOption}
              style={createOptionStyle}
              onMouseOver={handleCreateOptionMouseOver}
              onMouseOut={handleCreateOptionMouseOut}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
              <span>{createText}: "{inputValue.trim()}"</span>
            </div>
          )}

          {/* Lista de opções filtradas */}
          {filteredOptions.map((option, index) => {
            const displayText = getDisplayText(option);
            const isSelected = getDisplayText(selectedItem) === displayText;

            return (
              <div
                key={index}
                onClick={() => selectOption(option)}
                style={{
                  ...optionStyle,
                  ...(isSelected ? selectedOptionStyle : {})
                }}
                onMouseOver={(e) => handleOptionMouseOver(e, isSelected)}
                onMouseOut={(e) => handleOptionMouseOut(e, isSelected)}
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