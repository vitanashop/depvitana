import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail,
  Settings,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { EmailService, createAccessLink, formatApprovalDate } from '../services/emailService';
import { EmailConfigModal } from './EmailConfigModal';

export function SuperAdminDashboard() {
  const { 
    getAccessRequests, 
    getAuthorizedUsers, 
    getRestrictedUsers,
    approveAccess, 
    rejectAccess,
    restrictAccess,
    readmitUser,
    deleteUser,
    logout 
  } = useAuth();
  
  const { showNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'restricted'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [restrictingId, setRestrictingId] = useState<string | null>(null);
  const [restrictReason, setRestrictReason] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailConfigOpen, setEmailConfigOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const pendingRequests = getAccessRequests().filter(r => r.status === 'pending');
  const approvedUsers = getAuthorizedUsers();
  const restrictedUsers = getRestrictedUsers();

  const handleApprove = async (requestId: string) => {
    try {
      const request = pendingRequests.find(r => r.id === requestId);
      if (!request) return;

      await approveAccess(requestId);
      
      showNotification({
        type: 'success',
        title: 'Acesso Aprovado',
        message: `${request.fullName} foi aprovado com sucesso!`
      });

      // Tentar enviar email automaticamente
      try {
        setSendingEmail(requestId);
        const emailSent = await EmailService.sendAccessApprovedEmail({
          to_email: request.email,
          to_name: request.fullName,
          business_name: request.businessName,
          access_link: createAccessLink(),
          approval_date: formatApprovalDate(),
          from_name: 'Sistema Vitana',
          from_email: 'sistema@vitana.com'
        });

        if (emailSent) {
          showNotification({
            type: 'success',
            title: 'Email Enviado',
            message: `Email de aprovação enviado para ${request.email}`
          });
        } else {
          showNotification({
            type: 'warning',
            title: 'Email não enviado',
            message: 'Aprovação realizada, mas o email não foi enviado. Verifique as configurações de email.'
          });
        }
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        showNotification({
          type: 'warning',
          title: 'Email não enviado',
          message: 'Aprovação realizada, mas houve erro no envio do email.'
        });
      } finally {
        setSendingEmail(null);
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao aprovar acesso'
      });
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;

    try {
      await rejectAccess(rejectingId, rejectReason);
      showNotification({
        type: 'info',
        title: 'Acesso Rejeitado',
        message: 'Solicitação rejeitada com sucesso'
      });
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao rejeitar acesso'
      });
    }
  };

  const handleRestrict = async () => {
    if (!restrictingId || !restrictReason.trim()) return;

    try {
      await restrictAccess(restrictingId, restrictReason);
      showNotification({
        type: 'warning',
        title: 'Acesso Restrito',
        message: 'Usuário restrito com sucesso'
      });
      setRestrictingId(null);
      setRestrictReason('');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao restringir acesso'
      });
    }
  };

  const handleReadmit = async (userId: string) => {
    try {
      await readmitUser(userId);
      showNotification({
        type: 'success',
        title: 'Usuário Readmitido',
        message: 'Usuário readmitido com sucesso'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao readmitir usuário'
      });
    }
  };

  const handleResendEmail = async (user: any) => {
    try {
      setSendingEmail(user.id);
      
      const emailSent = await EmailService.sendAccessApprovedEmail({
        to_email: user.email,
        to_name: user.fullName,
        business_name: user.businessName,
        access_link: createAccessLink(),
        approval_date: formatApprovalDate(),
        from_name: 'Sistema Vitana',
        from_email: 'sistema@vitana.com'
      });

      if (emailSent) {
        showNotification({
          type: 'success',
          title: 'Email Reenviado',
          message: `Email reenviado para ${user.email}`
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Falha no envio',
          message: 'Não foi possível enviar o email. Verifique as configurações.'
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao reenviar email'
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    const currentUsers = activeTab === 'approved' ? approvedUsers : restrictedUsers;
    const allIds = new Set(currentUsers.map(u => u.id));
    setSelectedUsers(allIds);
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  const handleDeleteSelected = async () => {
    try {
      for (const userId of selectedUsers) {
        await deleteUser(userId);
      }
      
      showNotification({
        type: 'success',
        title: 'Usuários Removidos',
        message: `${selectedUsers.size} usuário(s) removido(s) com sucesso`
      });
      
      setSelectedUsers(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao remover usuários'
      });
    }
  };

  const stats = {
    pending: pendingRequests.length,
    approved: approvedUsers.length,
    restricted: restrictedUsers.length,
    total: pendingRequests.length + approvedUsers.length + restrictedUsers.length
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/30 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                <Users className="h-7 w-7 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Painel do Super Administrador</h1>
                <p className="text-gray-400">Gerencie acessos e permissões do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setEmailConfigOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Configurar Email"
              >
                <Settings className="h-4 w-4 mr-2" />
                Email
              </button>
              
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-black shadow-lg shadow-yellow-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg shadow-green-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Aprovados</p>
                <p className="text-3xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg shadow-red-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Restritos</p>
                <p className="text-3xl font-bold">{stats.restricted}</p>
              </div>
              <UserX className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pending', label: 'Solicitações Pendentes', count: stats.pending, icon: Clock },
                { id: 'approved', label: 'Usuários Aprovados', count: stats.approved, icon: UserCheck },
                { id: 'restricted', label: 'Usuários Restritos', count: stats.restricted, icon: UserX }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedUsers(new Set());
                  }}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Controles de seleção para abas de usuários */}
            {(activeTab === 'approved' || activeTab === 'restricted') && (
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectedUsers.size > 0 ? clearSelection : selectAllUsers}
                    className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {selectedUsers.size > 0 ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Limpar seleção
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Selecionar todos
                      </>
                    )}
                  </button>
                  
                  {selectedUsers.size > 0 && (
                    <span className="text-gray-300 text-sm">
                      {selectedUsers.size} usuário(s) selecionado(s)
                    </span>
                  )}
                </div>
                
                {selectedUsers.size > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover selecionados ({selectedUsers.size})
                  </button>
                )}
              </div>
            )}

            {/* Conteúdo das tabs */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-white">{request.fullName}</h3>
                            <span className="ml-3 px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full">
                              Pendente
                            </span>
                          </div>
                          <div className="space-y-1 text-gray-300">
                            <p><span className="text-gray-400">Email:</span> {request.email}</p>
                            <p><span className="text-gray-400">Estabelecimento:</span> {request.businessName}</p>
                            <p><span className="text-gray-400">Descrição:</span> {request.businessDescription}</p>
                            <p><span className="text-gray-400">Data da solicitação:</span> {request.requestDate.toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 ml-6">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={sendingEmail === request.id}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                          >
                            {sendingEmail === request.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovar
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setRejectingId(request.id)}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div className="space-y-4">
                {approvedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum usuário aprovado</p>
                  </div>
                ) : (
                  approvedUsers.map((user) => (
                    <div key={user.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="mt-1 h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
                              <span className="ml-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                Aprovado
                              </span>
                              {user.hasSetupPassword ? (
                                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                  Senhas OK
                                </span>
                              ) : (
                                <span className="ml-2 px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full">
                                  Pendente Config
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-gray-300">
                              <p><span className="text-gray-400">Email:</span> {user.email}</p>
                              <p><span className="text-gray-400">Estabelecimento:</span> {user.businessName}</p>
                              <p><span className="text-gray-400">Aprovado em:</span> {user.approvedDate.toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 ml-6">
                          <button
                            onClick={() => handleResendEmail(user)}
                            disabled={sendingEmail === user.id}
                            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors text-sm"
                            title="Reenviar email de aprovação"
                          >
                            {sendingEmail === user.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Reenviar Email
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setRestrictingId(user.id)}
                            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Restringir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'restricted' && (
              <div className="space-y-4">
                {restrictedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserX className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum usuário restrito</p>
                  </div>
                ) : (
                  restrictedUsers.map((user) => (
                    <div key={user.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="mt-1 h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
                              <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                Restrito
                              </span>
                            </div>
                            <div className="space-y-1 text-gray-300">
                              <p><span className="text-gray-400">Email:</span> {user.email}</p>
                              <p><span className="text-gray-400">Estabelecimento:</span> {user.businessName}</p>
                              <p><span className="text-gray-400">Restrito em:</span> {user.restrictionDate.toLocaleDateString('pt-BR')}</p>
                              <p><span className="text-gray-400">Motivo:</span> {user.restrictionReason}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 ml-6">
                          <button
                            onClick={() => handleReadmit(user.id)}
                            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Readmitir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de rejeição */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Rejeitar Solicitação</h3>
            <p className="text-gray-300 mb-4">Informe o motivo da rejeição:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
              placeholder="Motivo da rejeição..."
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de restrição */}
      {restrictingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Restringir Acesso</h3>
            <p className="text-gray-300 mb-4">Informe o motivo da restrição:</p>
            <textarea
              value={restrictReason}
              onChange={(e) => setRestrictReason(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
              placeholder="Motivo da restrição..."
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setRestrictingId(null);
                  setRestrictReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestrict}
                disabled={!restrictReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors"
              >
                Restringir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja remover {selectedUsers.size} usuário(s) selecionado(s)? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuração de email */}
      <EmailConfigModal 
        isOpen={emailConfigOpen} 
        onClose={() => setEmailConfigOpen(false)} 
      />
    </div>
  );
}