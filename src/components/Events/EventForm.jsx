import { useState, useEffect } from 'react';
import { SingleSelectCombobox } from '../SingleSelectComboBox/SingleSelectCombobox';

// Lista de produtos padrão
const PRODUTOS_PADRAO = [
  'Bolo de Chocolate',
  'Bolo de Cenoura',
  'Bolo de Coco',
  'Bolo de Morango',
  'Bolo Red Velvet',
  'Bolo de Limão',
  'Bolo de Laranja'
];

// Lista de pesos padrão
const PESOS_PADRAO = [
  '0.5kg', '1kg', '1.5kg', '2kg', '2.5kg', '3kg', '4kg', '5kg'
];

export default function EventForm({ inputData, onSubmit, children }) {
  const [status, setStatus] = useState(inputData?.status ?? 'A Fazer');
  const [produtos, setProdutos] = useState(PRODUTOS_PADRAO);
  const [pesos] = useState(PESOS_PADRAO);
  
  // Estado para múltiplos bolos
  const [bolos, setBolos] = useState([
    { id: 1, produto: '', peso: '', descricao: '' }
  ]);

  // Buscar produtos do Render
  const carregarProdutos = async () => {
    try {
      console.log('📦 Carregando produtos do Render...');
      const response = await fetch('https://organizationapp-backend.onrender.com/products');
      
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          const produtosDoBanco = data.products.map(p => p.name);
          const todosProdutos = [...new Set([...PRODUTOS_PADRAO, ...produtosDoBanco])];
          setProdutos(todosProdutos);
          console.log('✅ Produtos carregados:', todosProdutos.length);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      setProdutos(PRODUTOS_PADRAO);
    }
  };

  // Criar novo produto
  const criarProduto = async (nomeProduto) => {
    try {
      console.log('🔥 Criando produto:', nomeProduto);
      
      const response = await fetch('https://organizationapp-backend.onrender.com/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nomeProduto, 
          category: 'personalizado' 
        })
      });
      
      if (response.ok) {
        console.log('✅ Produto criado no Render!');
        // Adiciona à lista local
        if (!produtos.includes(nomeProduto)) {
          setProdutos([...produtos, nomeProduto]);
        }
        alert(`✅ Produto "${nomeProduto}" criado!`);
      } else {
        throw new Error('Erro no servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      // Adiciona localmente mesmo com erro
      if (!produtos.includes(nomeProduto)) {
        setProdutos([...produtos, nomeProduto]);
      }
      alert(`❌ Erro no servidor, mas produto "${nomeProduto}" foi adicionado localmente.`);
    }
  };

  // Buscar produtos na inicialização
  useEffect(() => {
    carregarProdutos();
  }, []);

  // Carregar dados existentes
  useEffect(() => {
    if (inputData) {
      setStatus(inputData.status || '');
      
      // Se tem produto individual
      if (inputData.produto) {
        setBolos([{
          id: 1,
          produto: inputData.produto,
          peso: inputData.peso || '',
          descricao: inputData.descricao || ''
        }]);
      }
      // Se tem bolosDetalhados
      else if (inputData.bolosDetalhados) {
        try {
          const detalhados = JSON.parse(inputData.bolosDetalhados);
          const bolosCarregados = detalhados.map((bolo, index) => ({
            id: index + 1,
            produto: bolo.nome || bolo.produto || '',
            peso: bolo.peso || '',
            descricao: bolo.descricao || ''
          }));
          if (bolosCarregados.length > 0) {
            setBolos(bolosCarregados);
          }
        } catch (error) {
          console.log('Erro ao carregar bolos detalhados');
        }
      }
      // Se tem products (formato antigo)
      else if (inputData.products) {
        const produtosAntigos = inputData.products.split('\n').filter(p => p.trim());
        const bolosAntigos = produtosAntigos.map((produto, index) => ({
          id: index + 1,
          produto: produto,
          peso: '',
          descricao: ''
        }));
        if (bolosAntigos.length > 0) {
          setBolos(bolosAntigos);
        }
      }
    }
  }, [inputData]);

  const adicionarBolo = () => {
    const novoId = Math.max(...bolos.map(b => b.id)) + 1;
    setBolos([...bolos, { id: novoId, produto: '', peso: '', descricao: '' }]);
  };

  const removerBolo = (id) => {
    if (bolos.length > 1) {
      setBolos(bolos.filter(b => b.id !== id));
    }
  };

  const atualizarBolo = (id, campo, valor) => {
    setBolos(bolos.map(bolo => 
      bolo.id === id ? { ...bolo, [campo]: valor } : bolo
    ));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Bolos válidos (com produto e peso)
    const bolosValidos = bolos.filter(b => b.produto && b.peso);
    
    // Compatibilidade - formato antigo
    data.products = bolosValidos.map(b => b.produto).join('\n');
    
    // Novos campos - primeiro bolo
    if (bolosValidos.length > 0) {
      data.produto = bolosValidos[0].produto;
      data.peso = bolosValidos[0].peso;
      data.descricao = bolosValidos[0].descricao;
    } else {
      data.produto = '';
      data.peso = '';
      data.descricao = '';
    }
    
    // Bolos detalhados - todos os bolos
    data.bolosDetalhados = JSON.stringify(bolosValidos.map(b => ({
      nome: b.produto,
      peso: b.peso,
      descricao: b.descricao
    })));
    
    data.status = status;
    
    console.log('Enviando dados:', data);
    onSubmit({ event: data });
  };

  return (
    <form id="event-form" onSubmit={handleSubmit}>
      <div className="control">
        <label htmlFor="title">Título</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={inputData?.title ?? ''}
          required
        />
      </div>

      {/* SEÇÃO DE BOLOS */}
      <div className="control">
        <label>Bolos do Pedido</label>
        
        <div className="bolos-container" style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '1rem' 
        }}>
          {bolos.map((bolo, index) => (
            <div key={bolo.id} className="bolo-item" style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              marginBottom: '1rem', 
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              {/* Cabeçalho do bolo */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <h4 style={{ margin: 0, color: '#495057' }}>
                  🎂 Bolo {index + 1}
                </h4>
                {bolos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerBolo(bolo.id)}
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

              {/* PRODUTO */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold' 
                }}>
                  Produto *
                </label>
                <SingleSelectCombobox
                  options={produtos}
                  selectedItem={bolo.produto}
                  onChange={(valor) => atualizarBolo(bolo.id, 'produto', valor)}
                  onCreateNew={criarProduto}
                  placeholder="Selecione ou digite um produto..."
                  allowCreate={true}
                />
                {!bolo.produto && (
                  <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Selecione um produto
                  </div>
                )}
              </div>

              {/* PESO */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold' 
                }}>
                  Peso *
                </label>
                <SingleSelectCombobox
                  options={pesos}
                  selectedItem={bolo.peso}
                  onChange={(valor) => atualizarBolo(bolo.id, 'peso', valor)}
                  placeholder="Ex: 2kg"
                  allowCreate={true}
                />
                {!bolo.peso && (
                  <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Selecione um peso
                  </div>
                )}
              </div>

              {/* DESCRIÇÃO */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold' 
                }}>
                  Descrição (Opcional)
                </label>
                <textarea
                  value={bolo.descricao}
                  onChange={(e) => atualizarBolo(bolo.id, 'descricao', e.target.value)}
                  placeholder="Detalhes do bolo (decoração, sabor, recheio, etc.)"
                  rows={2}
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

          {/* Botão adicionar bolo */}
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
              Adicionar Mais Bolo
            </button>
          </div>
        </div>

        {/* Info debug */}
        <div style={{ 
          color: '#999', 
          fontSize: '0.75rem',
          marginTop: '0.25rem'
        }}>
          📡 Produtos: {produtos.length} | 
          🎂 Bolos válidos: {bolos.filter(b => b.produto && b.peso).length}
        </div>
      </div>

      {/* Observações gerais */}
      <div className="control">
        <label htmlFor="description">Observações Gerais</label>
        <textarea
          id="description"
          name="description"
          placeholder="Observações sobre entrega, pagamento, etc."
          rows={3}
          defaultValue={inputData?.description ?? ''}
        />
      </div>

      {/* Campos originais */}
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
          <label htmlFor="time">Hora</label>
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