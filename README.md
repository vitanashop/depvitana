# 🏪 Sistema de Gestão Vitana

Sistema completo de gestão para depósitos de bebidas com foco em vendas, controle de estoque e emissão de NFCe.

## 🚀 Deploy no Railway

### Preparação Local

1. **Clone o repositório**
```bash
git clone <seu-repo>
cd sistema-gestao-vitana
```

2. **Instale as dependências**
```bash
npm install
```

3. **Teste localmente**
```bash
npm run dev
```

### Deploy Automático

1. **Conecte ao Railway**
   - Acesse [railway.app](https://railway.app)
   - Conecte sua conta GitHub
   - Selecione este repositório

2. **Configuração Automática**
   - O Railway detectará automaticamente o projeto Node.js
   - Usará as configurações do `railway.json`
   - Build será feito automaticamente

3. **Variáveis de Ambiente** (Opcional)
   ```
   NODE_ENV=production
   VITE_APP_URL=https://seu-dominio.railway.app
   ```

### Deploy Manual

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 🔧 Configurações de Produção

### Recursos Incluídos:
- ✅ **Nginx** para servir arquivos estáticos
- ✅ **Gzip** para compressão
- ✅ **Security headers** configurados
- ✅ **Client-side routing** funcionando
- ✅ **Health check** endpoint
- ✅ **Cache** otimizado para assets
- ✅ **Build** otimizado para produção

### Monitoramento:
- **Health Check**: `/health`
- **Logs**: Disponíveis no painel Railway
- **Métricas**: CPU, RAM, Requests

## 🌟 Funcionalidades

- 📊 Dashboard completo
- 📦 Gestão de produtos
- 🛒 Sistema de vendas (PDV)
- 📄 Emissão de NFCe
- 📈 Relatórios financeiros
- 🔔 Sistema de notificações
- 👥 Multi-usuário
- 📱 Interface responsiva

## 💡 Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Icons**: Lucide React
- **Deploy**: Railway + Docker + Nginx

## 🛟 Suporte

Para suporte técnico:
- 📧 Email: suporte@vitana.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Site: [vitana.com](https://vitana.com)

---

**Sistema Vitana v2.0** - Gestão Completa para Depósitos de Bebidas#   d e p o s i t o d e s u c e s s o  
 