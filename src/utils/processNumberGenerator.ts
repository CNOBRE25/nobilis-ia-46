/**
 * Utilitário para gerar números únicos de processo
 */

// Função para gerar número de processo baseado no tipo e ano
export function generateProcessNumber(tipoProcesso: string): string {
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Mapear tipos de processo para prefixos
  const prefixMap: Record<string, string> = {
    'investigacao_preliminar': 'IP',
    'sindicancia': 'SIN',
    'processo_administrativo': 'PA',
    'inquerito_policial_militar': 'IPM'
  };
  
  const prefix = prefixMap[tipoProcesso] || 'PROC';
  
  return `${prefix}-${currentYear}-${randomSuffix}`;
}

// Função para gerar número de processo com timestamp único
export function generateUniqueProcessNumber(tipoProcesso: string): string {
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now();
  const timeSuffix = timestamp.toString().slice(-6); // Últimos 6 dígitos do timestamp
  
  const prefixMap: Record<string, string> = {
    'investigacao_preliminar': 'IP',
    'sindicancia': 'SIN',
    'processo_administrativo': 'PA',
    'inquerito_policial_militar': 'IPM'
  };
  
  const prefix = prefixMap[tipoProcesso] || 'PROC';
  
  return `${prefix}-${currentYear}-${timeSuffix}`;
}

// Função para validar formato do número de processo
export function validateProcessNumber(numero: string): boolean {
  if (!numero || numero.trim() === '') {
    return false;
  }
  
  // Padrão: PREFIXO-ANO-NUMERO (ex: IP-2025-001)
  const pattern = /^[A-Z]{2,4}-\d{4}-\d{3,6}$/;
  return pattern.test(numero.trim());
}

// Função para formatar número de processo
export function formatProcessNumber(numero: string): string {
  if (!numero) return '';
  
  // Remover espaços e converter para maiúsculas
  let formatted = numero.trim().toUpperCase();
  
  // Se não tem o formato correto, tentar formatar
  if (!validateProcessNumber(formatted)) {
    // Se é apenas números, adicionar prefixo padrão
    if (/^\d+$/.test(formatted)) {
      const currentYear = new Date().getFullYear();
      formatted = `IP-${currentYear}-${formatted.padStart(3, '0')}`;
    }
  }
  
  return formatted;
}

// Função para obter próximo número sequencial (requer consulta ao banco)
export async function getNextSequentialNumber(
  tipoProcesso: string, 
  supabaseClient: any
): Promise<string> {
  try {
    const currentYear = new Date().getFullYear();
    const prefixMap: Record<string, string> = {
      'investigacao_preliminar': 'IP',
      'sindicancia': 'SIN',
      'processo_administrativo': 'PA',
      'inquerito_policial_militar': 'IPM'
    };
    
    const prefix = prefixMap[tipoProcesso] || 'PROC';
    const pattern = `${prefix}-${currentYear}-%`;
    
    // Buscar o maior número existente para este tipo e ano
    const { data, error } = await supabaseClient
      .from('processos')
      .select('numero_processo')
      .ilike('numero_processo', pattern)
      .order('numero_processo', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Erro ao buscar próximo número:', error);
      return generateUniqueProcessNumber(tipoProcesso);
    }
    
    if (!data || data.length === 0) {
      // Primeiro processo do ano
      return `${prefix}-${currentYear}-001`;
    }
    
    // Extrair o número do último processo
    const lastNumber = data[0].numero_processo;
    const match = lastNumber.match(new RegExp(`${prefix}-${currentYear}-(\\d+)`));
    
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `${prefix}-${currentYear}-${nextNum.toString().padStart(3, '0')}`;
    }
    
    // Fallback
    return generateUniqueProcessNumber(tipoProcesso);
    
  } catch (error) {
    console.error('Erro ao gerar número sequencial:', error);
    return generateUniqueProcessNumber(tipoProcesso);
  }
}

// Função para verificar se número de processo já existe
export async function checkProcessNumberExists(
  numero: string, 
  supabaseClient: any
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('processos')
      .select('id')
      .eq('numero_processo', numero)
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar número de processo:', error);
      return false;
    }
    
    return data && data.length > 0;
    
  } catch (error) {
    console.error('Erro ao verificar número de processo:', error);
    return false;
  }
}

// Função principal para gerar número único garantido
export async function generateGuaranteedUniqueNumber(
  tipoProcesso: string,
  supabaseClient: any,
  maxAttempts: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateNumber = generateUniqueProcessNumber(tipoProcesso);
    const exists = await checkProcessNumberExists(candidateNumber, supabaseClient);
    
    if (!exists) {
      return candidateNumber;
    }
  }
  
  // Se não conseguir gerar um único após várias tentativas, usar timestamp completo
  const timestamp = Date.now();
  const currentYear = new Date().getFullYear();
  const prefixMap: Record<string, string> = {
    'investigacao_preliminar': 'IP',
    'sindicancia': 'SIN',
    'processo_administrativo': 'PA',
    'inquerito_policial_militar': 'IPM'
  };
  
  const prefix = prefixMap[tipoProcesso] || 'PROC';
  return `${prefix}-${currentYear}-${timestamp}`;
} 