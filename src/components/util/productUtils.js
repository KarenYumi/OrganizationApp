/**
 * Converte array de produtos para string formatada para salvar no banco
 * Exemplo: ["Bolo de Chocolate", "Bolo de Cenoura"] vira "Bolo de Chocolate\nBolo de Cenoura"
 */
export function productsToString(products) {
  if (!products || !Array.isArray(products)) return '';
  return products.filter(p => p && p.trim()).join('\n');
}

/**
 * Converte string de produtos do banco para array
 * Exemplo: "Bolo de Chocolate\nBolo de Cenoura" vira ["Bolo de Chocolate", "Bolo de Cenoura"]
 */
export function stringToProducts(productString) {
  if (!productString || typeof productString !== 'string') return [];
  return productString.split('\n').filter(p => p && p.trim());
}

/**
 * Formata produtos para exibição como lista com pontos
 * Exemplo: ["Bolo de Chocolate", "Bolo de Cenoura"] vira "• Bolo de Chocolate\n• Bolo de Cenoura"
 */
export function formatProductsForDisplay(products) {
  if (!products || !Array.isArray(products)) return '';
  return products
    .filter(p => p && p.trim())
    .map(product => `• ${product}`)
    .join('\n');
}

/**
 * Formata produtos para exibição em texto simples (para preview)
 * Exemplo: ["Bolo de Chocolate", "Bolo de Cenoura"] vira "Bolo de Chocolate, Bolo de Cenoura"
 */
export function formatProductsPreview(products, maxLength = 50) {
  if (!products || !Array.isArray(products)) return '';
  
  const validProducts = products.filter(p => p && p.trim());
  if (validProducts.length === 0) return '';

  const preview = validProducts.join(', ');
  
  if (preview.length <= maxLength) {
    return preview;
  }
  
  return preview.substring(0, maxLength - 3) + '...';
}