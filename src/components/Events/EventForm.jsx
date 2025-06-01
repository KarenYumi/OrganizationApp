import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MultiSelectCombobox } from '../MultiSelectComboBox/MultiSelectCombobox.jsx';
import { fetchProducts, createNewProduct } from '../util/http.js';
import { queryClient } from '../util/http.js';

export default function EventForm({ inputData, onSubmit, children }) {
  const [status, setStatus] = useState(inputData?.status ?? '');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Busca produtos do backend
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: ({ signal }) => fetchProducts({ signal }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar novo produto
  const { mutate: createProduct } = useMutation({
    mutationFn: createNewProduct,
    onSuccess: () => {
      // Atualiza a lista de produtos
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
      // Aqui você pode mostrar uma notificação de erro
    }
  });

  useEffect(() => {
    setStatus(inputData?.status ?? '');
    
    // Se está editando um pedido existente
    if (inputData) {
      // Pega produtos do campo products ou da description (compatibilidade)
      if (inputData.products) {
        const products = inputData.products.split('\n').filter(p => p.trim());
        setSelectedProducts(products);
      } else if (inputData.description) {
        // Para compatibilidade com dados antigos
        const lines = inputData.description.split('\n').filter(p => p.trim());
        if (lines.length <= 5 && lines.every(line => line.length < 50)) {
          setSelectedProducts(lines);
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

    onSubmit({ event: data });
  }

  // Função para lidar com mudanças nos produtos selecionados
  const handleProductsChange = (products) => {
    setSelectedProducts(products);
  };

  // Função para criar um novo produto
  const handleCreateNewProduct = (newProductName) => {
    createProduct({ 
      name: newProductName,
      category: 'personalizado' 
    });
    
    // Adiciona temporariamente aos selecionados (será confirmado quando a mutation retornar)
    setSelectedProducts(prev => [...prev, newProductName]);
  };

  // Prepara lista de produtos para o combobox
  const availableProducts = productsData ? productsData.map(p => p.name) : [];

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
        {productsLoading ? (
          <p>Carregando produtos...</p>
        ) : (
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