import { useState, useEffect } from 'react';
import { SingleSelectCombobox } from '../SingleSelectComboBox/SingleSelectCombobox';

// Lista temporária caso o backend não funcione
const PRODUTOS_FALLBACK = [
  'Bolo de Chocolate',
  'Bolo de Cenoura', 
  'Bolo de Coco',
  'Bolo de Morango',
  'Bolo Red Velvet'
];

const PESOS_DISPONIVEIS = [
  '2kg',
  '5kg',
  '10kg',
  '15kg'
];

export default function EventForm({ inputData, onSubmit, children }) {
  const [status, setStatus] = useState(inputData?.status ?? '');
  const [availableProducts, setAvailableProducts] = useState(PRODUTOS_FALLBACK);
  const [pesosDisponiveis, setPesosDisponiveis] = useState(PESOS_DISPONIVEIS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  // Estado para gerenciar os bolos do pedido
  const [bolosPedido, setBolosPedido] = useState([
    { 
      id: 1, 
      bolo: '',
      peso: '',
      descricao: ''
    }
  ]);

  // CORRIGIDO: Função para buscar produtos do backend (URL local)
  const fetchProducts = async () => {
    try {
      console.log('Tentando buscar produtos do servidor local...');
      const response = await fetch('http://localhost:3000/products');
      
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
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError(error.message);
      // Mantém a lista fallback em caso de erro
      setAvailableProducts(PRODUTOS_FALLBACK);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // CORRIGIDO: Função para criar novo produto (URL local)
  const createNewProduct = async (productName) => {
    try {
      console.log('Criando produto:', productName);
      const response = await fetch('http://localhost:3000/products', {
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
      
      // Adiciona o produto à lista local
      setAvailableProducts(prev => {
        if (!prev.includes(productName)) {
          return [...prev, productName];
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      // Mesmo com erro, adiciona à lista local
      setAvailableProducts(prev => {
        if (!prev.includes(productName)) {
          return [...prev, productName];
        }
        return prev;
      });
    }
  };

  // Funções para gerenciar bolos
  const adicionarBolo = () => {
    const novoId = Math.max(...bolosPedido.map(b => b.id)) + 1;
    setBolosPedido([
      ...bolosPedido,
      { 
        id: novoId, 
        bolo: '',
        peso: '',
        descricao: ''
      }
    ]);
  };

  const removerBolo = (id) => {
    if (bolosPedido.length > 1) {
      setBolosPedido(bolosPedido.filter(b => b.id !== id));
    }
  };

  const atualizarBolo = (id, campo, valor) => {
    setBolosPedido(bolosPedido.map(bolo => 
      bolo.id === id ? { ...bolo, [campo]: valor } : bolo
    ));
  };

  // Função para quando um novo produto é criado
  const handleCreateNewProduct = (newProductName) => {
    console.log('Criando novo produto:', newProductName);
    createNewProduct(newProductName);
  };

  // Função para quando um novo peso é criado
  const handleCreateNewPeso = (newPeso) => {
    console.log('Criando novo peso:', newPeso);
    if (newPeso && !pesosDisponiveis.includes(newPeso)) {
      setPesosDisponiveis([...pesosDisponiveis, newPeso]);
    }
  };

  useEffect(() => {
    setStatus(inputData?.status ?? '');
    fetchProducts();
    
    // CORRIGIDO: Melhor tratamento dos dados existentes
    if (inputData) {
      // Primeiro tenta os novos campos individuais
      if (inputData.produto || inputData.peso || inputData.descricao) {
        setBolosPedido([{
          id: 1,
          bolo: inputData.produto || '',
          peso: inputData.peso || '',
          descricao: inputData.descricao || ''
        }]);
      }
      // Depois tenta bolosDetalhados
      else if (inputData.bolosDetalhados) {
        try {
          const bolosDetalhados = JSON.parse(inputData.bolosDetalhados);
          const bolosFormatados = bolosDetalhados.map((bolo, index) => ({
            id: index + 1,
            bolo: bolo.nome || bolo.bolo || '',
            peso: bolo.peso || '',
            descricao: bolo.descricao || ''
          }));
          if (bolosFormatados.length > 0) {
            setBolosPedido(bolosFormatados);
          }
        } catch (error) {
          console.error('Erro ao parsear bolos detalhados:', error);
        }
      }
      // Por último, tenta o formato antigo
      else if (inputData.products) {
        const products = inputData.products.split('\n').filter(p => p.trim());
        const bolosExistentes = products.map((produto, index) => ({
          id: index + 1,
          bolo: produto,
          peso: '',
          descricao: ''
        }));
        
        if (bolosExistentes.length > 0) {
          setBolosPedido(bolosExistentes);
        }
      }
    }
  }, [inputData]);

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Constrói os dados dos bolos
    const bolosValidos = bolosPedido.filter(bolo => 
      bolo.bolo && bolo.peso
    );
    
    // CORRIGIDO: Adicionando os novos campos individuais para o backend
    if (bolosValidos.length > 0) {
      // Para compatibilidade com sistema antigo
      data.products = bolosValidos.map(bolo => bolo.bolo).join('\n');
      
      // Novos campos individuais (primeiro bolo)
      data.produto = bolosValidos[0].bolo;
      data.peso = bolosValidos[0].peso;
      data.descricao = bolosValidos[0].descricao;
      
      // Campo detalhado para múltiplos bolos
      data.bolosDetalhados = JSON.stringify(bolosValidos.map(bolo => ({
        nome: bolo.bolo,
        peso: bolo.peso,
        descricao: bolo.descricao
      })));
    } else {
      data.products = '';
      data.produto = '';
      data.peso = '';
      data.descricao = '';
      data.bolosDetalhados = '[]';
    }
    
    data.status = status;

    console.log('Dados do formulário:', data);
    console.log('Bolos detalhados:', bolosValidos);
    onSubmit({ event: data });
  }

  return (
    <form id="event-form" onSubmit={handleSubmit}>
      <div className="control">
        <label htmlFor="title">Titulo</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={inputData?.title ?? ''}
          required
        />
      </div>

      {/* SEÇÃO DE SELEÇÃO DE BOLOS */}
      <div className="control">
        <label>Seleção de Bolos</label>
        
        {error && (
          <div style={{ 
            color: 'red', 
            fontSize: '0.8rem', 
            marginBottom: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
            border: '1px solid #ffcccc'
          }}>
            Erro: {error} (usando lista padrão)
          </div>
        )}
        
        {isLoadingProducts && (
          <div style={{ color: '#666', padding: '0.5rem' }}>
            Carregando produtos...
          </div>
        )}

        {/* Lista de bolos do pedido */}
        <div className="bolos-container" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          {bolosPedido.map((boloItem, index) => (
            <div key={boloItem.id} className="bolo-item" style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              marginBottom: '1rem', 
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              {/* Cabeçalho do bolo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#495057' }}>Bolo {index + 1}</h4>
                {bolosPedido.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerBolo(boloItem.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Remover bolo"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Seleção de Bolo */}
              <div className="bolo-field" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Escolher Bolo *
                </label>
                <SingleSelectCombobox
                  options={availableProducts}
                  selectedItem={boloItem.bolo}
                  onChange={(selected) => atualizarBolo(boloItem.id, 'bolo', selected)}
                  onCreateNew={handleCreateNewProduct}
                  placeholder="Digite ou selecione um bolo..."
                  createText="Criar novo bolo"
                  noResultsText="Nenhum bolo encontrado"
                  allowCreate={true}
                  maxHeight="10rem"
                />
                {!boloItem.bolo && (
                  <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Selecione um bolo
                  </div>
                )}
              </div>

              {/* Seleção de Peso */}
              <div className="peso-field" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Escolher Peso *
                </label>
                <SingleSelectCombobox
                  options={pesosDisponiveis}
                  selectedItem={boloItem.peso}
                  onChange={(selected) => atualizarBolo(boloItem.id, 'peso', selected)}
                  onCreateNew={handleCreateNewPeso}
                  placeholder="Digite ou selecione um peso..."
                  createText="Criar novo peso"
                  noResultsText="Nenhum peso encontrado"
                  allowCreate={true}
                  maxHeight="8rem"
                />
                {!boloItem.peso && (
                  <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Selecione um peso
                  </div>
                )}
              </div>

              {/* Descrição específica do bolo */}
              <div className="descricao-field">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Descrição do Bolo
                </label>
                <textarea
                  value={boloItem.descricao}
                  onChange={(e) => atualizarBolo(boloItem.id, 'descricao', e.target.value)}
                  placeholder="Descreva detalhes específicos deste bolo (sabor, decoração, observações...)"
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    borderRadius: '4px', 
                    border: '1px solid #ced4da',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          ))}

          {/* Botão para adicionar mais bolos */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={adicionarBolo}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span>
              Adicionar mais bolos
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div style={{ 
          color: '#999', 
          fontSize: '0.75rem',
          marginTop: '0.25rem'
        }}>
          Produtos disponíveis: {availableProducts.length} | 
          Bolos no pedido: {bolosPedido.filter(b => b.bolo && b.peso).length}
        </div>
      </div>

      {/* Campo de observações gerais */}
      <div className="control">
        <label htmlFor="description">Observações Gerais do Pedido</label>
        <textarea
          id="description"
          name="description"
          placeholder="Observações gerais sobre o pedido (entrega, pagamento, etc...)"
          rows={3}
          defaultValue={inputData?.description ?? ''}
        />
      </div>

      {/* Campos originais mantidos */}
      <div className="controls-row">
        <div className="control">
          <label htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={inputData?.date ?? ''}
            required
          />
        </div>

        <div className="control">
          <label htmlFor="time">Horas</label>
          <input
            type="time"
            id="time"
            name="time"
            defaultValue={inputData?.time ?? ''}
            required
          />
        </div>
      </div>

      <div className="control">
        <label htmlFor="address">Endereço</label>
        <input
          type="text"
          id="address"
          name="address"
          defaultValue={inputData?.address ?? ''}
          required
        />
      </div>

      <div className="control">
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
      </div>

      <div className="form-actions">{children}</div>
    </form>
  );
}