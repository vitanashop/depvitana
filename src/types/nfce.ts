export interface NFCeItem {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorDesconto?: number;
  aliquotaICMS: number;
  valorICMS: number;
  cst: string;
}

interface NFCeEmitente {
  cnpj: string;
  inscricaoEstadual: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  telefone?: string;
  email?: string;
}

interface NFCeDestinatario {
  cpfCnpj?: string;
  nome?: string;
  email?: string;
}

export interface NFCePagamento {
  formaPagamento: string; // 01-Dinheiro, 02-Cheque, 03-Cartão Crédito, etc
  valor: number;
  cnpjCredenciadora?: string;
  bandeira?: string;
  autorizacao?: string;
}

interface NFCeTransporte {
  modalidadeFrete: number; // 9-Sem Ocorrência de Transporte
}

export interface NFCe {
  id: string;
  numero: number;
  serie: number;
  dataEmissao: Date;
  dataVencimento?: Date;
  
  // Identificação
  codigoNumerico: string;
  digitoVerificador: number;
  tipoEmissao: number; // 1-Normal, 9-Contingência
  finalidade: number; // 1-Normal, 2-Complementar, etc
  consumidorPresente: number; // 1-Presencial, 2-Internet, etc
  
  // Sujeitos
  emitente: NFCeEmitente;
  destinatario?: NFCeDestinatario;
  
  // Produtos/Serviços
  itens: NFCeItem[];
  
  // Totais
  baseCalculoICMS: number;
  valorICMS: number;
  valorTotalProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  valorDesconto: number;
  valorOutrasDespesas: number;
  valorTotalNota: number;
  
  // Tributos
  valorTotalTributos: number;
  informacoesTributarias: string;
  
  // Pagamento
  pagamentos: NFCePagamento[];
  
  // Transporte
  transporte: NFCeTransporte;
  
  // Informações Adicionais
  informacoesAdicionais?: string;
  observacoes?: string;
  
  // Controle SEFAZ
  chaveAcesso?: string;
  protocoloAutorizacao?: string;
  dataAutorizacao?: Date;
  status: 'pendente' | 'autorizada' | 'rejeitada' | 'cancelada';
  motivoRejeicao?: string;
  
  // XML
  xmlGerado?: string;
  xmlAutorizado?: string;
  
  // Relacionamentos
  vendaId: string;
  usuarioId: string;
}

export interface NFCeConfig {
  emitente: NFCeEmitente;
  serie: number;
  proximoNumero: number;
  ambiente: 'homologacao' | 'producao';
  certificado?: {
    arquivo: string;
    senha: string;
    validade: Date;
  };
  contingencia: boolean;
  justificativaContingencia?: string;
}

interface NFCeConsulta {
  chaveAcesso: string;
  status: string;
  dataConsulta: Date;
  protocoloConsulta: string;
}