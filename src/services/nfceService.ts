import { NFCe, NFCeConfig, NFCeItem, NFCePagamento } from '../types/nfce';
import { Sale } from '../types';

export class NFCeService {
  private static config: NFCeConfig | null = null;

  static setConfig(config: NFCeConfig) {
    this.config = config;
    localStorage.setItem('nfce-config', JSON.stringify(config));
  }

  static getConfig(): NFCeConfig | null {
    if (!this.config) {
      const saved = localStorage.getItem('nfce-config');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    }
    return this.config;
  }

  static async gerarNFCe(venda: Sale): Promise<NFCe> {
    const config = this.getConfig();
    if (!config) {
      throw new Error('Configuração da NFCe não encontrada');
    }

    const numeroNota = config.proximoNumero;
    const codigoNumerico = this.gerarCodigoNumerico();
    const chaveAcesso = this.gerarChaveAcesso(numeroNota, config.serie, codigoNumerico);

    // Converter itens da venda para itens da NFCe
    const itens: NFCeItem[] = venda.items.map((item, index) => ({
      codigo: (index + 1).toString().padStart(3, '0'),
      descricao: item.productName,
      ncm: '22021000', // NCM genérico para bebidas
      cfop: '5102', // Venda no estado
      unidade: 'UN',
      quantidade: item.quantity,
      valorUnitario: item.unitPrice,
      valorTotal: item.total,
      aliquotaICMS: 18, // Alíquota genérica
      valorICMS: item.total * 0.18,
      cst: '00' // Tributada integralmente
    }));

    // Converter forma de pagamento
    const pagamentos: NFCePagamento[] = [{
      formaPagamento: this.converterFormaPagamento(venda.paymentMethod),
      valor: venda.total
    }];

    // Calcular totais
    const valorTotalProdutos = itens.reduce((total, item) => total + item.valorTotal, 0);
    const valorICMS = itens.reduce((total, item) => total + item.valorICMS, 0);
    const valorTotalTributos = valorICMS;

    const nfce: NFCe = {
      id: `NFCE-${Date.now()}`,
      numero: numeroNota,
      serie: config.serie,
      dataEmissao: venda.date,
      
      codigoNumerico,
      digitoVerificador: this.calcularDigitoVerificador(chaveAcesso.substring(0, 43)),
      tipoEmissao: config.contingencia ? 9 : 1,
      finalidade: 1,
      consumidorPresente: 1,
      
      emitente: config.emitente,
      
      itens,
      
      baseCalculoICMS: valorTotalProdutos,
      valorICMS,
      valorTotalProdutos,
      valorFrete: 0,
      valorSeguro: 0,
      valorDesconto: 0,
      valorOutrasDespesas: 0,
      valorTotalNota: venda.total,
      
      valorTotalTributos,
      informacoesTributarias: `Valor aproximado dos tributos: ${this.formatCurrency(valorTotalTributos)} (${((valorTotalTributos / venda.total) * 100).toFixed(2)}%) Fonte: IBPT`,
      
      pagamentos,
      
      transporte: {
        modalidadeFrete: 9
      },
      
      chaveAcesso,
      status: 'pendente',
      vendaId: venda.id,
      usuarioId: 'current-user'
    };

    // Gerar XML
    nfce.xmlGerado = this.gerarXML(nfce);

    // Atualizar próximo número
    config.proximoNumero++;
    this.setConfig(config);

    return nfce;
  }

  static async transmitirNFCe(nfce: NFCe): Promise<NFCe> {
    console.log('🚀 Transmitindo NFCe para SEFAZ...');
    
    // Simular transmissão para SEFAZ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular resposta da SEFAZ (95% de sucesso)
    const sucesso = Math.random() > 0.05;
    
    if (sucesso) {
      nfce.status = 'autorizada';
      nfce.protocoloAutorizacao = `135${Date.now().toString().slice(-10)}`;
      nfce.dataAutorizacao = new Date();
      nfce.chaveAcesso = nfce.chaveAcesso;
      
      // Simular XML autorizado
      nfce.xmlAutorizado = nfce.xmlGerado?.replace(
        '<infNFe>',
        `<infNFe><infProt><tpAmb>2</tpAmb><verAplic>SP_NFE_PL_008i2</verAplic><chNFe>${nfce.chaveAcesso}</chNFe><dhRecbto>${new Date().toISOString()}</dhRecbto><nProt>${nfce.protocoloAutorizacao}</nProt><digVal>...</digVal><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt>`
      );
      
      console.log('✅ NFCe autorizada com sucesso!');
    } else {
      nfce.status = 'rejeitada';
      nfce.motivoRejeicao = 'Erro de validação - Consulte o administrador';
      console.log('❌ NFCe rejeitada pela SEFAZ');
    }
    
    return nfce;
  }

  static async cancelarNFCe(nfce: NFCe, justificativa: string): Promise<NFCe> {
    if (nfce.status !== 'autorizada') {
      throw new Error('Apenas NFCe autorizadas podem ser canceladas');
    }

    if (justificativa.length < 15) {
      throw new Error('Justificativa deve ter pelo menos 15 caracteres');
    }

    console.log('🚫 Cancelando NFCe...');
    
    // Simular cancelamento na SEFAZ
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    nfce.status = 'cancelada';
    nfce.observacoes = `CANCELADA - ${justificativa}`;
    
    console.log('✅ NFCe cancelada com sucesso!');
    
    return nfce;
  }

  private static converterFormaPagamento(formaPagamento: string): string {
    const mapeamento: Record<string, string> = {
      'dinheiro': '01',
      'pix': '17',
      'cartão': '03',
      'débito': '04'
    };
    return mapeamento[formaPagamento] || '99';
  }

  private static gerarCodigoNumerico(): string {
    return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  }

  private static gerarChaveAcesso(numero: number, serie: number, codigoNumerico: string): string {
    const config = this.getConfig()!;
    const uf = '35'; // São Paulo
    const aamm = new Date().toISOString().substring(2, 7).replace('-', '');
    const cnpj = config.emitente.cnpj.replace(/\D/g, '');
    const mod = '65'; // NFCe
    const serieFormatada = serie.toString().padStart(3, '0');
    const numeroFormatado = numero.toString().padStart(9, '0');
    const tipoEmissao = config.contingencia ? '9' : '1';

    const chaveSemDV = uf + aamm + cnpj + mod + serieFormatada + numeroFormatado + tipoEmissao + codigoNumerico;
    const dv = this.calcularDigitoVerificador(chaveSemDV);
    
    return chaveSemDV + dv;
  }

  private static calcularDigitoVerificador(chave: string): number {
    const pesos = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let soma = 0;
    for (let i = 0; i < chave.length; i++) {
      soma += parseInt(chave[i]) * pesos[i];
    }
    
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  private static gerarXML(nfce: NFCe): string {
    const dataEmissao = nfce.dataEmissao.toISOString().substring(0, 19) + '-03:00';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00" Id="NFe${nfce.chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${nfce.codigoNumerico}</cNF>
        <natOp>Venda</natOp>
        <mod>65</mod>
        <serie>${nfce.serie}</serie>
        <nNF>${nfce.numero}</nNF>
        <dhEmi>${dataEmissao}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>${nfce.emitente.endereco.municipio}</cMunFG>
        <tpImp>4</tpImp>
        <tpEmis>${nfce.tipoEmissao}</tpEmis>
        <cDV>${nfce.digitoVerificador}</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>${nfce.emitente.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${nfce.emitente.razaoSocial}</xNome>
        <xFant>${nfce.emitente.nomeFantasia}</xFant>
        <enderEmit>
          <xLgr>${nfce.emitente.endereco.logradouro}</xLgr>
          <nro>${nfce.emitente.endereco.numero}</nro>
          <xBairro>${nfce.emitente.endereco.bairro}</xBairro>
          <cMun>3550308</cMun>
          <xMun>${nfce.emitente.endereco.municipio}</xMun>
          <UF>${nfce.emitente.endereco.uf}</UF>
          <CEP>${nfce.emitente.endereco.cep.replace(/\D/g, '')}</CEP>
        </enderEmit>
        <IE>${nfce.emitente.inscricaoEstadual}</IE>
        <CRT>1</CRT>
      </emit>
      ${nfce.itens.map((item, index) => `
      <det nItem="${index + 1}">
        <prod>
          <cProd>${item.codigo}</cProd>
          <cEAN></cEAN>
          <xProd>${item.descricao}</xProd>
          <NCM>${item.ncm}</NCM>
          <CFOP>${item.cfop}</CFOP>
          <uCom>${item.unidade}</uCom>
          <qCom>${item.quantidade.toFixed(4)}</qCom>
          <vUnCom>${item.valorUnitario.toFixed(2)}</vUnCom>
          <vProd>${item.valorTotal.toFixed(2)}</vProd>
          <cEANTrib></cEANTrib>
          <uTrib>${item.unidade}</uTrib>
          <qTrib>${item.quantidade.toFixed(4)}</qTrib>
          <vUnTrib>${item.valorUnitario.toFixed(2)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>${item.cst}</CST>
              <modBC>3</modBC>
              <vBC>${item.valorTotal.toFixed(2)}</vBC>
              <pICMS>${item.aliquotaICMS.toFixed(2)}</pICMS>
              <vICMS>${item.valorICMS.toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>`).join('')}
      <total>
        <ICMSTot>
          <vBC>${nfce.baseCalculoICMS.toFixed(2)}</vBC>
          <vICMS>${nfce.valorICMS.toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>${nfce.valorTotalProdutos.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${nfce.valorTotalNota.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>9</modFrete>
      </transp>
      <pag>
        ${nfce.pagamentos.map(pag => `
        <detPag>
          <tPag>${pag.formaPagamento}</tPag>
          <vPag>${pag.valor.toFixed(2)}</vPag>
        </detPag>`).join('')}
      </pag>
      <infAdic>
        <infCpl>${nfce.informacoesTributarias}</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
</nfeProc>`;
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  static gerarDANFCe(nfce: NFCe): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>DANF-Ce ${nfce.numero}</title>
    <style>
        body { font-family: monospace; margin: 0; padding: 10px; font-size: 12px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .linha { border-top: 1px dashed #000; margin: 5px 0; }
        .header { margin-bottom: 10px; }
        .item { margin: 2px 0; }
        .total { font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="center header">
        <div class="bold">${nfce.emitente.nomeFantasia}</div>
        <div>${nfce.emitente.razaoSocial}</div>
        <div>CNPJ: ${this.formatCNPJ(nfce.emitente.cnpj)}</div>
        <div>IE: ${nfce.emitente.inscricaoEstadual}</div>
        <div>${nfce.emitente.endereco.logradouro}, ${nfce.emitente.endereco.numero}</div>
        <div>${nfce.emitente.endereco.bairro} - ${nfce.emitente.endereco.municipio}/${nfce.emitente.endereco.uf}</div>
        <div>CEP: ${this.formatCEP(nfce.emitente.endereco.cep)}</div>
    </div>
    
    <div class="linha"></div>
    <div class="center bold">CUPOM FISCAL ELETRÔNICO - SAT</div>
    <div class="center">NFCe nº ${nfce.numero.toString().padStart(9, '0')} Série ${nfce.serie.toString().padStart(3, '0')}</div>
    <div class="center">${nfce.dataEmissao.toLocaleDateString('pt-BR')} ${nfce.dataEmissao.toLocaleTimeString('pt-BR')}</div>
    
    <div class="linha"></div>
    
    ${nfce.itens.map(item => `
    <div class="item">
        <div>${item.descricao}</div>
        <div>Qtde: ${item.quantidade} ${item.unidade} x ${this.formatCurrency(item.valorUnitario)} = ${this.formatCurrency(item.valorTotal)}</div>
    </div>
    `).join('')}
    
    <div class="linha"></div>
    <div class="total center">TOTAL: ${this.formatCurrency(nfce.valorTotalNota)}</div>
    
    <div class="linha"></div>
    <div class="bold">FORMA DE PAGAMENTO:</div>
    ${nfce.pagamentos.map(pag => `
    <div>${this.getFormaPagamentoNome(pag.formaPagamento)}: ${this.formatCurrency(pag.valor)}</div>
    `).join('')}
    
    <div class="linha"></div>
    <div class="center">
        <div>Chave de Acesso</div>
        <div class="bold">${nfce.chaveAcesso?.replace(/(.{4})/g, '$1 ')}</div>
    </div>
    
    <div class="center" style="margin-top: 10px;">
        <div style="font-size: 10px;">${nfce.informacoesTributarias}</div>
    </div>
    
    <div class="center" style="margin-top: 10px;">
        <div>Consulte pela Chave de Acesso em</div>
        <div class="bold">www.nfce.fazenda.sp.gov.br</div>
    </div>
    
    ${nfce.status === 'autorizada' ? `
    <div class="center" style="margin-top: 10px;">
        <div class="bold">NFCe AUTORIZADA</div>
        <div>Protocolo: ${nfce.protocoloAutorizacao}</div>
        <div>${nfce.dataAutorizacao?.toLocaleDateString('pt-BR')} ${nfce.dataAutorizacao?.toLocaleTimeString('pt-BR')}</div>
    </div>
    ` : ''}
    
    ${nfce.status === 'cancelada' ? `
    <div class="center" style="margin-top: 10px;">
        <div class="bold">NFCe CANCELADA</div>
    </div>
    ` : ''}
</body>
</html>`;
  }

  private static formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  private static formatCEP(cep: string): string {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  private static getFormaPagamentoNome(codigo: string): string {
    const nomes: Record<string, string> = {
      '01': 'Dinheiro',
      '02': 'Cheque',
      '03': 'Cartão de Crédito',
      '04': 'Cartão de Débito',
      '17': 'PIX',
      '99': 'Outros'
    };
    return nomes[codigo] || 'Não informado';
  }
}