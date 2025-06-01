import { useState, useEffect } from 'react';
import { MultiSelectCombobox } from '../MultiSelectComboBox/MultiSelectCombobox.jsx';

// Lista temporária caso o backend não funcione
const PRODUTOS_FALLBACK = [
  'Bolo de Chocolate',
  'Bolo de Cenoura', 
  'Bolo de Coco',
  'Bolo de Morango',
  'Bolo Red Velvet'
];

export default function EventForm({ inputData, onSubmit, children }) {
  const [status, setStatus] = useState(inputData?.status ?? '');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState(PRODUTOS_FALLBACK);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar produtos do backend
  const fetchProducts = async () => {
    try {
      console.log('Tentando buscar produtos...');
      const response = await fetch('https://organizationapp-backend.onrender.com/products');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Produtos recebidos:', data);
      
      if (data.products && Array.isArray(data.products)) {
        const productNames = data.products.map(p => p.name);
        setAvailableProducts(productNames);
        console.log('Produtos processados:', productNames);
      } else {
        console.warn('Formato de dados inesperado:', data);
        // Mantém produtos fallback
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError(error.message);
      // Mantém produtos fallback em caso de erro
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Função para criar novo produto
  const createNewProduct = async (productName) => {
    try {
      console.log('Criando produto:', productName);
      const response = await fetch('https://organizationapp-backend.onrender.com/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productName,
          category: 'personalizado'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar produto: ${response.status}`);
      }

      const data = await response.json();
      console.log('Produto criado:', data);

      // Adiciona à lista local
      setAvailableProducts(prev => [...prev, productName]);
      
      // Adiciona aos selecionados
      setSelectedProducts(prev => [...prev, productName]);
      
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      // Adiciona apenas localmente se der erro
      setAvailableProducts(prev => [...prev, productName]);
      setSelectedProducts(prev => [...prev, productName]);
    }
  };

  useEffect(() => {
    setStatus(inputData?.status ?? '');
    
    // Busca produtos do backend
    fetchProducts();
    
    // Se está editando um pedido existente
    if (inputData) {
      if (inputData.products) {
        const products = inputData.products.split('\n').filter(p => p.trim());
        setSelectedProducts(products);
        console.log('Produtos carregados para edição:', products);
      } else if (inputData.description) {
        // Compatibilidade com formato antigo
        const lines = inputData.description.split('\n').filter(p => p.trim());
        if (lines.length <= 5 && lines.every(line => line.length < 50)) {
          setSelectedProducts(lines);
          console.log('Produtos do formato antigo:', lines);
        }
      }
    }
  }, [inputData]);

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Adiciona produtos como campo separado
    data.products = selectedProducts.join('\n');
    data.status = status;

    console.log('Dados do formulário:', data);
    onSubmit({ event: data });
  }

  const handleProductsChange = (products) => {
    console.log('Produtos selecionados mudaram:', products);
    setSelectedProducts(products);
  };

  const handleCreateNewProduct = (newProductName) => {
    console.log('Solicitação para criar produto:', newProductName);
    createNewProduct(newProductName);
  };

  return (
    <form id="event-form" onSubmit={handleSubmit}>
      <p className="control">
        <label htmlFor="title">Titulo</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={inputData?.title ?? ''}
          required
        />
      </p>

      {/* Campo de seleção de produtos */}
      <p className="control">
        <label htmlFor="products">Produtos</label>
        
        {/* Debug info */}
        {error && (
          <div style={{ color: 'red', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Erro: {error} (usando lista padrão)
          </div>
        )}
        
        {isLoadingProducts ? (
          <p style={{ color: '#666' }}>Carregando produtos...</p>
        ) : (
          <>
            <MultiSelectCombobox
              options={availableProducts}
              selectedItems={selectedProducts}
              onChange={handleProductsChange}
              onCreateNew={handleCreateNewProduct}
              placeholder="Digite ou selecione os bolos..."
              createText="Criar novo bolo"
              noResultsText="Nenhum bolo encontrado"
              allowCreate={true}
            />
            
            {/* Debug: mostra produtos disponíveis */}
            <small style={{ color: '#999', fontSize: '0.75rem' }}>
              Produtos disponíveis: {availableProducts.length} | 
              Selecionados: {selectedProducts.length}
            </small>
          </>
        )}
        
        {selectedProducts.length === 0 && (
          <small style={{ color: '#666', fontSize: '0.875rem' }}>
            Selecione pelo menos um produto
          </small>
        )}
      </p>

      {/* Campo de descrição/observações */}
      <p className="control">
        <label htmlFor="description">Observações Adicionais</label>
        <textarea
          id="description"
          name="description"
          placeholder="Observações especiais, decoração, instruções especiais, etc..."
          rows={3}
          defaultValue={inputData?.description ?? ''}
        />
      </p>

      <div className="controls-row">
        <p className="control">
          <label htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={inputData?.date ?? ''}
            required
          />
        </p>

        <p className="control">
          <label htmlFor="time">Horas</label>
          <input
            type="time"
            id="time"
            name="time"
            defaultValue={inputData?.time ?? ''}
            required
          />
        </p>
      </div>

      <p className="control">
        <label htmlFor="address">Endereço</label>
        <input
          type="text"
          id="address"
          name="address"
          defaultValue={inputData?.address ?? ''}
          required
        />
      </p>

      <p className="control">
        <label htmlFor="status">Status</label>
        <select
          name="status"
          id="status"
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="A fazer">A fazer</option>
          <option value="Pendente">Pendente</option>
          <option value="Pronto">Pronto</option>
          <option value="Entregue">Entregue</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </p>

      <p className="form-actions">{children}</p>
    </form>
  );
}