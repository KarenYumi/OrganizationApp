import { useState, useEffect } from 'react';

const MultiSelectCombobox = ({
  options = [],
  selectedItems = [],
  onChange,
  placeholder = 'Digite ou selecione produtos...',
  allowCreate = true,
  createText = 'Criar novo produto',
  noResultsText = 'Nenhum produto encontrado',
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
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  // Função para selecionar uma opção
  const selectOption = (option) => {
    const displayText = getDisplayText(option);
    
    // Verifica se o item já está selecionado
    const isAlreadySelected = selectedItems.some(item => 
      getDisplayText(item) === displayText
    );

    if (!isAlreadySelected) {
      const newSelectedItems = [...selectedItems, option];
      onChange(newSelectedItems);
    }

    // Limpa o input e fecha o dropdown
    setInputValue('');
    setIsOpen(false);
    setFilteredOptions(options);
  };

  // Função para criar um novo produto
  const createNewOption = () => {
    setIsOpen(false);
    
    const newProduct = inputValue.trim();
    if (newProduct) {
      if (onCreateNew && typeof onCreateNew === 'function') {
        onCreateNew(newProduct);
      } else {
        selectOption(newProduct);
      }
    }
    
    setInputValue('');
  };

  // Função para remover um item selecionado
  const removeSelectedItem = (itemToRemove) => {
    const newSelectedItems = selectedItems.filter(item => 
      getDisplayText(item) !== getDisplayText(itemToRemove)
    );
    onChange(newSelectedItems);
  };

  // Verifica se é uma nova opção
  const isNewOption = inputValue.trim() && allowCreate &&
    !options.some(item => getDisplayText(item) === inputValue.trim()) &&
    !selectedItems.some(item => getDisplayText(item) === inputValue.trim());

  // Função para lidar com o blur (perda de foco)
  const handleBlur = (e) => {
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('[data-dropdown]')) {
      setTimeout(() => setIsOpen(false), 150);
    }
  };

  // Funções para os efeitos hover
  const handleTagButtonMouseOver = (e) => {
    e.target.style.backgroundColor = '#d1d9e6';
  };

  const handleTagButtonMouseOut = (e) => {
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

  const tagsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  };

  const tagStyle = {
    backgroundColor: '#e1e6f0',
    color: '#2f82ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const tagButtonStyle = {
    background: 'none',
    border: 'none',
    borderRadius: '50%',
    padding: '0.125rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const inputContainerStyle = {
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 2rem 0.5rem 0.75rem',
    border: '1px solid #2f82ff',
    borderRadius: '4px',
    fontSize: '1.1rem',
    fontFamily: 'inherit'
  };

  const chevronButtonStyle = {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
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

  const createOptionHoverStyle = {
    backgroundColor: '#f0f8ff'
  };

  const optionStyle = {
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const optionHoverStyle = {
    backgroundColor: '#f5f5f5'
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
      {/* Tags dos itens selecionados */}
      {selectedItems.length > 0 && (
        <div style={tagsContainerStyle}>
          {selectedItems.map((item, index) => (
            <div key={index} style={tagStyle}>
              <span>{getDisplayText(item)}</span>
              <button
                type="button"
                onClick={() => removeSelectedItem(item)}
                style={tagButtonStyle}
                onMouseOver={handleTagButtonMouseOver}
                onMouseOut={handleTagButtonMouseOut}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input principal */}
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={inputStyle}
          className={className}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={chevronButtonStyle}
        >
          ▼
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div data-dropdown style={dropdownStyle}>
          {/* Opção para criar novo produto */}
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
            const isSelected = selectedItems.some(item => 
              getDisplayText(item) === displayText
            );

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

export { MultiSelectCombobox };