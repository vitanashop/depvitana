import emailjs from '@emailjs/browser';

interface EmailTemplate {
  to_email: string;
  to_name: string;
  business_name: string;
  access_link: string;
  approval_date: string;
  from_name: string;
  from_email: string;
  restrictionReason?: string;
  reset_code?: string;
  reset_link?: string;
}

interface EmailConfig {
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  useEmailJS: boolean;
  emailJSServiceId: string;
  emailJSTemplateId: string;
  emailJSPublicKey: string;
}

export class EmailService {
  private static getConfig(): EmailConfig | null {
    try {
      const configStr = localStorage.getItem('email-config');
      if (!configStr) {
        console.warn('📧 Configuração de email não encontrada');
        return null;
      }
      return JSON.parse(configStr);
    } catch (error) {
      console.error('❌ Erro ao carregar configuração de email:', error);
      return null;
    }
  }

  private static validateConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.useEmailJS) {
      if (!config.emailJSServiceId?.trim()) {
        errors.push('Service ID é obrigatório');
      } else if (!config.emailJSServiceId.startsWith('service_')) {
        errors.push('Service ID deve começar com "service_"');
      }
      
      if (!config.emailJSTemplateId?.trim()) {
        errors.push('Template ID é obrigatório');
      } else if (!config.emailJSTemplateId.startsWith('template_')) {
        errors.push('Template ID deve começar com "template_"');
      }
      
      if (!config.emailJSPublicKey?.trim()) {
        errors.push('Public Key é obrigatória');
      }
    } else {
      if (!config.smtpHost) errors.push('Servidor SMTP é obrigatório');
      if (!config.smtpPort) errors.push('Porta SMTP é obrigatória');
      if (!config.smtpUser) errors.push('Usuário SMTP é obrigatório');
      if (!config.smtpPassword) errors.push('Senha SMTP é obrigatória');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static async sendAccessApprovedEmail(params: EmailTemplate): Promise<boolean> {
    console.log('🚀 INICIANDO ENVIO DE EMAIL DE APROVAÇÃO');
    console.log('📧 Destinatário:', params.to_email);
    console.log('👤 Nome:', params.to_name);
    console.log('🏢 Estabelecimento:', params.business_name);
    
    const config = this.getConfig();
    if (!config) {
      console.error('❌ ERRO: Configuração de email não encontrada');
      console.error('💡 SOLUÇÃO: Configure o email em Configurações → E-mail');
      return false;
    }

    console.log('⚙️ Método de envio:', config.useEmailJS ? 'EmailJS' : 'SMTP');

    const validation = this.validateConfig(config);
    if (!validation.valid) {
      console.error('❌ ERRO: Configuração de email inválida:');
      validation.errors.forEach(error => console.error('   • ' + error));
      console.error('💡 SOLUÇÃO: Corrija os erros acima em Configurações → E-mail');
      return false;
    }

    if (config.useEmailJS) {
      return await this.sendViaEmailJS(params, config);
    } else {
      return await this.sendViaSMTP(params);
    }
  }

  static async sendPasswordResetEmail(params: EmailTemplate & { reset_code: string }): Promise<boolean> {
    console.log('🔑 INICIANDO ENVIO DE EMAIL DE RECUPERAÇÃO DE SENHA');
    console.log('📧 Destinatário:', params.to_email);
    console.log('👤 Nome:', params.to_name);
    console.log('🔐 Código:', params.reset_code);
    
    const config = this.getConfig();
    if (!config) {
      console.error('❌ ERRO: Configuração de email não encontrada');
      return false;
    }

    const validation = this.validateConfig(config);
    if (!validation.valid) {
      console.error('❌ ERRO: Configuração de email inválida:', validation.errors);
      return false;
    }

    try {
      if (config.useEmailJS) {
        emailjs.init(config.emailJSPublicKey);

        const templateParams = {
          to_email: params.to_email,
          to_name: params.to_name,
          reset_code: params.reset_code,
          reset_link: params.reset_link || `${window.location.origin}/?reset=${params.reset_code}`,
          from_name: config.fromName,
          from_email: config.fromEmail,
          subject: `🔑 Recuperação de Senha - ${params.business_name || 'Sistema Vitana'}`,
          message: this.createPasswordResetEmailContent(params),
          expires_in: '30 minutos',
          company_name: 'Sistema Vitana',
          support_email: config.fromEmail,
          year: new Date().getFullYear().toString()
        };

        console.log('📋 Parâmetros do template de recuperação preparados:');
        console.log('   📧 Para:', templateParams.to_email);
        console.log('   🔐 Código:', templateParams.reset_code);
        console.log('   📌 Assunto:', templateParams.subject);

        // Tentar usar template específico de recuperação, senão usar o padrão
        let templateId = config.emailJSTemplateId.replace('approved', 'password_reset');
        if (templateId === config.emailJSTemplateId) {
          templateId = config.emailJSTemplateId;
        }

        const response = await emailjs.send(
          config.emailJSServiceId,
          templateId,
          templateParams
        );

        if (response.status === 200) {
          console.log('✅ EMAIL DE RECUPERAÇÃO ENVIADO COM SUCESSO!');
          return true;
        } else {
          console.error('❌ FALHA NO ENVIO DO EMAIL DE RECUPERAÇÃO');
          return false;
        }
      } else {
        return await this.sendPasswordResetViaSMTP(params);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      return false;
    }
  }

  private static async sendViaEmailJS(params: EmailTemplate, config: EmailConfig): Promise<boolean> {
    try {
      console.log('📨 ENVIANDO VIA EMAILJS');
      console.log('🔑 Service ID:', config.emailJSServiceId);
      console.log('📄 Template ID:', config.emailJSTemplateId);
      console.log('🔐 Public Key:', config.emailJSPublicKey?.substring(0, 10) + '...');
      
      // Inicializar EmailJS
      console.log('🔧 Inicializando EmailJS...');
      emailjs.init(config.emailJSPublicKey);
      console.log('✅ EmailJS inicializado com sucesso');

      // Preparar parâmetros do template
      const templateParams = {
        // Campos básicos obrigatórios
        to_email: params.to_email,
        to_name: params.to_name,
        from_name: config.fromName,
        from_email: config.fromEmail,
        
        // Campos específicos do template
        business_name: params.business_name,
        access_link: params.access_link,
        approval_date: params.approval_date,
        
        // Campos auxiliares
        subject: `🎉 Acesso Aprovado - ${params.business_name}`,
        greeting: `Olá ${params.to_name}!`,
        message: this.createEmailContent(params),
        
        // Campos do rodapé
        footer_text: 'Sistema de Gestão Vitana',
        footer_note: 'Este é um e-mail automático. Por favor, não responda.',
        
        // Campos extras que podem ser úteis
        company_name: 'Sistema Vitana',
        support_email: config.fromEmail,
        year: new Date().getFullYear().toString()
      };

      console.log('📋 Parâmetros do template preparados:');
      console.log('   📧 Para:', templateParams.to_email);
      console.log('   👤 Nome:', templateParams.to_name);
      console.log('   📨 De:', templateParams.from_email);
      console.log('   📌 Assunto:', templateParams.subject);

      // Verificar se o EmailJS foi carregado
      if (typeof emailjs === 'undefined' || !emailjs.send) {
        throw new Error('EmailJS não carregado corretamente. Verifique a conexão com a internet.');
      }

      console.log('📤 Enviando email...');
      const response = await emailjs.send(
        config.emailJSServiceId,
        config.emailJSTemplateId,
        templateParams
      );

      console.log('📬 Resposta do EmailJS:', response);
      
      if (response.status === 200) {
        console.log('✅ EMAIL ENVIADO COM SUCESSO!');
        console.log('📨 Status:', response.status);
        console.log('📝 Text:', response.text);
        return true;
      } else {
        console.error('❌ FALHA NO ENVIO:');
        console.error('📊 Status:', response.status);
        console.error('📝 Resposta:', response.text);
        return false;
      }
    } catch (error: any) {
      console.error('❌ ERRO CRÍTICO NO EMAILJS:');
      console.error('🔍 Tipo do erro:', error.constructor.name);
      console.error('📝 Mensagem:', error.message);
      
      // Análise detalhada do erro
      if (error.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes('template') && message.includes('not found')) {
          console.error('🎯 PROBLEMA IDENTIFICADO: Template não encontrado');
          console.error('💡 SOLUÇÕES:');
          console.error('   1. Verifique se o Template ID está correto');
          console.error('   2. Acesse https://dashboard.emailjs.com/admin/templates');
          console.error('   3. Confirme se o template existe e está ativo');
          console.error('   4. Template ID deve ter formato: template_xxxxxx');
        } else if (message.includes('service') && message.includes('not found')) {
          console.error('🎯 PROBLEMA IDENTIFICADO: Serviço não encontrado');
          console.error('💡 SOLUÇÕES:');
          console.error('   1. Verifique se o Service ID está correto');
          console.error('   2. Acesse https://dashboard.emailjs.com/admin');
          console.error('   3. Confirme se o serviço existe e está conectado');
          console.error('   4. Service ID deve ter formato: service_xxxxxx');
        } else if (message.includes('user') || message.includes('public key')) {
          console.error('🎯 PROBLEMA IDENTIFICADO: Chave pública inválida');
          console.error('💡 SOLUÇÕES:');
          console.error('   1. Verifique a Public Key no painel EmailJS');
          console.error('   2. Acesse https://dashboard.emailjs.com/admin/account');
          console.error('   3. Copie a Public Key correta');
          console.error('   4. Verifique se a conta está ativa');
        } else if (message.includes('network') || message.includes('fetch')) {
          console.error('🎯 PROBLEMA IDENTIFICADO: Problema de conexão');
          console.error('💡 SOLUÇÕES:');
          console.error('   1. Verifique a conexão com a internet');
          console.error('   2. Tente novamente em alguns minutos');
          console.error('   3. Verifique se o EmailJS está funcionando');
        } else if (message.includes('cors')) {
          console.error('🎯 PROBLEMA IDENTIFICADO: Problema de CORS');
          console.error('💡 SOLUÇÕES:');
          console.error('   1. Verifique as configurações de domínio no EmailJS');
          console.error('   2. Adicione seu domínio nas configurações');
        }
      }
      
      if (error.stack) {
        console.error('📚 Stack trace:', error.stack);
      }
      
      console.error('🔧 PARA DEBUG ADICIONAL:');
      console.error('   1. Abra o Network tab (F12)');
      console.error('   2. Tente enviar novamente');
      console.error('   3. Verifique as requisições para api.emailjs.com');
      console.error('   4. Veja os códigos de status HTTP');
      
      return false;
    }
  }

  static async sendAccessRestrictedEmail(params: EmailTemplate & { restrictionReason: string }): Promise<boolean> {
    console.log('🚫 Enviando email de restrição de acesso...');
    
    const config = this.getConfig();
    if (!config) {
      console.error('❌ Configuração de email não encontrada');
      return false;
    }

    const validation = this.validateConfig(config);
    if (!validation.valid) {
      console.error('❌ Configuração de email inválida:', validation.errors);
      return false;
    }

    try {
      if (config.useEmailJS) {
        emailjs.init(config.emailJSPublicKey);

        const templateParams = {
          to_email: params.to_email,
          to_name: params.to_name,
          business_name: params.business_name,
          restriction_reason: params.restrictionReason,
          restriction_date: params.approval_date,
          from_name: config.fromName,
          from_email: config.fromEmail,
          message: this.createRestrictionEmailContent(params),
          subject: `🚫 Acesso Restrito - ${params.business_name}`
        };

        // Tentar usar template específico de restrição, senão usar o padrão
        let templateId = config.emailJSTemplateId.replace('approved', 'restricted');
        if (templateId === config.emailJSTemplateId) {
          templateId = config.emailJSTemplateId;
        }

        const response = await emailjs.send(
          config.emailJSServiceId,
          templateId,
          templateParams
        );

        return response.status === 200;
      } else {
        return await this.sendViaSMTP(params);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de restrição:', error);
      return false;
    }
  }

  static async sendTestEmail(testEmail: string): Promise<boolean> {
    console.log('🧪 INICIANDO TESTE DE EMAIL');
    console.log('📧 Email de teste:', testEmail);
    
    const testParams: EmailTemplate = {
      to_email: testEmail,
      to_name: 'Usuário de Teste',
      business_name: 'Estabelecimento de Teste',
      access_link: createAccessLink(),
      approval_date: formatApprovalDate(),
      from_name: 'Sistema Vitana',
      from_email: 'contatovitanashop@gmail.com'
    };

    console.log('📋 Parâmetros de teste preparados');
    const result = await this.sendAccessApprovedEmail(testParams);
    
    if (result) {
      console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    } else {
      console.log('💥 TESTE FALHOU - Verifique os logs acima');
    }
    
    return result;
  }

  private static createEmailContent(params: EmailTemplate): string {
    return `
🎉 ACESSO APROVADO - Sistema de Gestão Vitana

Olá ${params.to_name}!

Sua solicitação de acesso ao Sistema de Gestão foi APROVADA! 

📋 DETALHES DO ACESSO:
• Estabelecimento: ${params.business_name}
• Data de Aprovação: ${params.approval_date}
• Status: ✅ AUTORIZADO

🔗 LINK DE ACESSO:
${params.access_link}

📖 PRÓXIMOS PASSOS:
1. Clique no link de acesso acima
2. Use seu e-mail (${params.to_email}) para entrar
3. Configure seu estabelecimento
4. Comece a usar o sistema!

💡 RECURSOS DISPONÍVEIS:
• Gestão completa de produtos
• Controle de estoque em tempo real
• Sistema de vendas (PDV)
• Relatórios financeiros
• Interface moderna e intuitiva

🛟 SUPORTE:
Em caso de dúvidas, entre em contato:
📧 E-mail: ${params.from_email}
⏰ Horário: Segunda a Sexta, 8h às 18h

Bem-vindo ao Sistema de Gestão Vitana!

---
Este é um e-mail automático. Por favor, não responda.
`;
  }

  private static createRestrictionEmailContent(params: EmailTemplate & { restrictionReason: string }): string {
    return `
🚫 ACESSO RESTRITO - Sistema de Gestão Vitana

Olá ${params.to_name},

Informamos que seu acesso ao Sistema de Gestão foi RESTRITO.

📋 DETALHES DA RESTRIÇÃO:
• Estabelecimento: ${params.business_name}
• Data da Restrição: ${params.approval_date}
• Status: ❌ ACESSO RESTRITO
• Motivo: ${params.restrictionReason}

❗ IMPORTANTE:
• Suas sessões ativas foram invalidadas
• Não será possível fazer novos logins
• Dados do estabelecimento foram preservados

📞 CONTATO:
Se você acredita que isso é um erro ou tem dúvidas sobre esta decisão, entre em contato:
📧 E-mail: ${params.from_email}
⏰ Horário: Segunda a Sexta, 8h às 18h

---
Sistema de Gestão Vitana
Este é um e-mail automático. Por favor, não responda.
`;
  }

  private static createPasswordResetEmailContent(params: EmailTemplate & { reset_code: string }): string {
    return `
🔑 RECUPERAÇÃO DE SENHA - Sistema de Gestão Vitana

Olá ${params.to_name}!

Recebemos uma solicitação para redefinir sua senha de acesso ao Sistema de Gestão.

🔐 CÓDIGO DE RECUPERAÇÃO:
${params.reset_code}

📋 INSTRUÇÕES:
1. Acesse a página de login do sistema
2. Clique em "Esqueci minha senha"
3. Digite seu e-mail: ${params.to_email}
4. Insira o código: ${params.reset_code}
5. Defina sua nova senha

⏰ VALIDADE:
Este código expira em 30 minutos por segurança.
Data/Hora da solicitação: ${new Date().toLocaleString('pt-BR')}

❗ IMPORTANTE:
• Se você não solicitou esta recuperação, ignore este email
• Nunca compartilhe este código com terceiros
• Mantenha sua senha segura e pessoal

🔗 LINK DIRETO (opcional):
${params.reset_link || `${window.location.origin}/?reset=${params.reset_code}`}

🛟 SUPORTE:
Em caso de problemas, entre em contato:
📧 E-mail: ${params.from_email}
⏰ Horário: Segunda a Sexta, 8h às 18h

---
Sistema de Gestão Vitana
Este é um e-mail automático. Por favor, não responda.
`;
  }

  // Método para envio de recuperação via SMTP (simulado)
  static async sendPasswordResetViaSMTP(params: EmailTemplate & { reset_code: string }): Promise<boolean> {
    try {
      console.log('🔑 SIMULANDO ENVIO DE RECUPERAÇÃO VIA SMTP');
      console.log('📧 Para:', params.to_email);
      console.log('🔐 Código:', params.reset_code);
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso (95% das vezes)
      const success = Math.random() > 0.05;
      
      if (success) {
        console.log('✅ EMAIL DE RECUPERAÇÃO SMTP ENVIADO COM SUCESSO (simulado)');
      } else {
        console.log('❌ FALHA NO ENVIO DE RECUPERAÇÃO SMTP (simulado)');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro no envio SMTP de recuperação:', error);
      return false;
    }
  }

  // Método para envio via SMTP (simulado)
  static async sendViaSMTP(params: EmailTemplate): Promise<boolean> {
    try {
      console.log('📧 SIMULANDO ENVIO VIA SMTP');
      console.log('📧 Para:', params.to_email);
      console.log('📝 Conteúdo preparado:', this.createEmailContent(params).substring(0, 100) + '...');
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso (95% das vezes)
      const success = Math.random() > 0.05;
      
      if (success) {
        console.log('✅ EMAIL SMTP ENVIADO COM SUCESSO (simulado)');
      } else {
        console.log('❌ FALHA NO ENVIO SMTP (simulado)');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro no envio SMTP:', error);
      return false;
    }
  }
}

export const createAccessLink = (baseUrl: string = window.location.origin): string => {
  return `${baseUrl}/?access=authorized`;
};

export const formatApprovalDate = (): string => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};