import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operator';
  businessId: string;
  email: string;
  hasCustomPassword: boolean;
}

export interface AccessRequest {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  businessDescription: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AuthorizedUser {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  approvedDate: Date;
  hasSetupPassword: boolean;
}

export interface RestrictedUser {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  originalApprovalDate: Date;
  restrictionDate: Date;
  restrictionReason: string;
}

export interface BusinessInfo {
  id: string;
  name: string;
  subtitle: string;
  logoUrl: string;
  useCustomLogo: boolean;
  plan: 'free' | 'premium';
  createdAt: Date;
  ownerId?: string;
}

interface UserCredentials {
  username: string;
  password: string;
  role: 'admin' | 'operator';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  pendingPasswordUser: AuthorizedUser | null;
  
  // Funções do sistema normal
  login: (email: string, username: string, password: string) => Promise<boolean>;
  setupDualPasswords: (email: string, adminCredentials: UserCredentials, operatorCredentials: UserCredentials) => Promise<boolean>;
  checkUserPasswordStatus: (email: string) => 'not_found' | 'needs_setup' | 'ready';
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<boolean>;
  validateResetCode: (email: string, resetCode: string) => boolean;
  logout: () => void;
  
  // Funções do super admin
  superAdminLogin: (password: string) => Promise<boolean>;
  requestAccess: (request: Omit<AccessRequest, 'id' | 'requestDate' | 'status'>) => Promise<void>;
  getAccessRequests: () => AccessRequest[];
  getAuthorizedUsers: () => AuthorizedUser[];
  getRestrictedUsers: () => RestrictedUser[];
  approveAccess: (requestId: string) => Promise<void>;
  rejectAccess: (requestId: string, reason: string) => Promise<void>;
  checkEmailAccess: (email: string) => boolean;
  restrictAccess: (userId: string, reason: string) => Promise<void>;
  readmitUser: (restrictedUserId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Funções de estabelecimentos
  getBusinesses: () => BusinessInfo[];
  createBusiness: (business: Omit<BusinessInfo, 'id' | 'createdAt'>) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_PASSWORD = 'SuperAdmin2024!';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [pendingPasswordUser, setPendingPasswordUser] = useState<AuthorizedUser | null>(null);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('current-user');
    const savedSuperAdmin = localStorage.getItem('super-admin-session');
    
    if (savedSuperAdmin) {
      setIsSuperAdmin(true);
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Funções do Super Admin
  const superAdminLogin = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password === SUPER_ADMIN_PASSWORD) {
      setIsSuperAdmin(true);
      localStorage.setItem('super-admin-session', 'true');
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const requestAccess = async (requestData: Omit<AccessRequest, 'id' | 'requestDate' | 'status'>): Promise<void> => {
    const requests = getAccessRequests();
    const newRequest: AccessRequest = {
      ...requestData,
      id: Date.now().toString(),
      requestDate: new Date(),
      status: 'pending'
    };
    
    requests.push(newRequest);
    localStorage.setItem('access-requests', JSON.stringify(requests));
  };

  const getAccessRequests = (): AccessRequest[] => {
    const requests = localStorage.getItem('access-requests');
    if (requests) {
      return JSON.parse(requests).map((r: any) => ({
        ...r,
        requestDate: new Date(r.requestDate)
      }));
    }
    return [];
  };

  const getAuthorizedUsers = (): AuthorizedUser[] => {
    const users = localStorage.getItem('authorized-users');
    if (users) {
      return JSON.parse(users).map((u: any) => ({
        ...u,
        approvedDate: new Date(u.approvedDate)
      }));
    }
    return [];
  };

  const getRestrictedUsers = (): RestrictedUser[] => {
    const users = localStorage.getItem('restricted-users');
    if (users) {
      return JSON.parse(users).map((u: any) => ({
        ...u,
        originalApprovalDate: new Date(u.originalApprovalDate),
        restrictionDate: new Date(u.restrictionDate)
      }));
    }
    return [];
  };

  const approveAccess = async (requestId: string): Promise<void> => {
    const requests = getAccessRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) return;
    
    // Atualizar status da solicitação
    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    );
    localStorage.setItem('access-requests', JSON.stringify(updatedRequests));
    
    // Adicionar à lista de usuários autorizados
    const authorizedUsers = getAuthorizedUsers();
    const newAuthorizedUser: AuthorizedUser = {
      id: Date.now().toString(),
      fullName: request.fullName,
      email: request.email,
      businessName: request.businessName,
      approvedDate: new Date(),
      hasSetupPassword: false // ✅ SEMPRE false - OBRIGATÓRIO configurar senhas DUPLAS
    };
    
    authorizedUsers.push(newAuthorizedUser);
    localStorage.setItem('authorized-users', JSON.stringify(authorizedUsers));
  };

  const restrictAccess = async (userId: string, reason: string): Promise<void> => {
    const authorizedUsers = getAuthorizedUsers();
    const userToRestrict = authorizedUsers.find(u => u.id === userId);
    
    if (!userToRestrict) return;
    
    // Remover da lista de autorizados
    const updatedUsers = authorizedUsers.filter(u => u.id !== userId);
    localStorage.setItem('authorized-users', JSON.stringify(updatedUsers));
    
    // Adicionar à lista de restritos
    const restrictedUsers = getRestrictedUsers();
    const newRestrictedUser: RestrictedUser = {
      id: userToRestrict.id,
      fullName: userToRestrict.fullName,
      email: userToRestrict.email,
      businessName: userToRestrict.businessName,
      originalApprovalDate: userToRestrict.approvedDate,
      restrictionDate: new Date(),
      restrictionReason: reason
    };
    
    restrictedUsers.push(newRestrictedUser);
    localStorage.setItem('restricted-users', JSON.stringify(restrictedUsers));
  };

  const readmitUser = async (restrictedUserId: string): Promise<void> => {
    const restrictedUsers = getRestrictedUsers();
    const userToReadmit = restrictedUsers.find(u => u.id === restrictedUserId);
    
    if (!userToReadmit) return;
    
    // Remover da lista de restritos
    const updatedRestrictedUsers = restrictedUsers.filter(u => u.id !== restrictedUserId);
    localStorage.setItem('restricted-users', JSON.stringify(updatedRestrictedUsers));
    
    // Adicionar de volta à lista de autorizados
    const authorizedUsers = getAuthorizedUsers();
    const readmittedUser: AuthorizedUser = {
      id: userToReadmit.id,
      fullName: userToReadmit.fullName,
      email: userToReadmit.email,
      businessName: userToReadmit.businessName,
      approvedDate: new Date(), // Nova data de aprovação
      hasSetupPassword: false // ✅ DEVE configurar novas senhas OBRIGATORIAMENTE
    };
    
    authorizedUsers.push(readmittedUser);
    localStorage.setItem('authorized-users', JSON.stringify(authorizedUsers));
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const authorizedUsers = getAuthorizedUsers();
    const updatedUsers = authorizedUsers.filter(u => u.id !== userId);
    localStorage.setItem('authorized-users', JSON.stringify(updatedUsers));
  };

  const rejectAccess = async (requestId: string, reason: string): Promise<void> => {
    const requests = getAccessRequests();
    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r
    );
    localStorage.setItem('access-requests', JSON.stringify(updatedRequests));
  };

  const checkEmailAccess = (email: string): boolean => {
    const authorizedUsers = getAuthorizedUsers();
    return authorizedUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    const authorizedUsers = getAuthorizedUsers();
    const user = authorizedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || !user.hasSetupPassword) {
      return false;
    }
    
    // Gerar código de recuperação
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const resetData = {
      email: email.toLowerCase(),
      resetCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      requestedAt: new Date()
    };
    
    // Salvar código de recuperação
    const resetRequests = JSON.parse(localStorage.getItem('password-reset-requests') || '[]');
    const existingIndex = resetRequests.findIndex((req: any) => req.email === email.toLowerCase());
    
    if (existingIndex >= 0) {
      resetRequests[existingIndex] = resetData;
    } else {
      resetRequests.push(resetData);
    }
    
    localStorage.setItem('password-reset-requests', JSON.stringify(resetRequests));
    
    // Simular envio de e-mail (em produção, enviar e-mail real)
    console.log(`📧 Código de recuperação para ${email}: ${resetCode}`);
    
    return true;
  };

  const validateResetCode = (email: string, resetCode: string): boolean => {
    const resetRequests = JSON.parse(localStorage.getItem('password-reset-requests') || '[]');
    const request = resetRequests.find((req: any) => 
      req.email === email.toLowerCase() && 
      req.resetCode === resetCode.toUpperCase()
    );
    
    if (!request) return false;
    
    const now = new Date();
    const expiresAt = new Date(request.expiresAt);
    
    return now < expiresAt;
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
    if (!validateResetCode(email, resetCode)) {
      return false;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Atualizar senha do usuário
    const allCredentials = JSON.parse(localStorage.getItem('user-credentials') || '[]');
    const userIndex = allCredentials.findIndex((cred: any) => cred.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      setIsLoading(false);
      return false;
    }
    
    // Atualizar senha
    allCredentials[userIndex].password = newPassword;
    allCredentials[userIndex].lastPasswordChange = new Date();
    localStorage.setItem('user-credentials', JSON.stringify(allCredentials));
    
    // Remover código de recuperação usado
    const resetRequests = JSON.parse(localStorage.getItem('password-reset-requests') || '[]');
    const updatedRequests = resetRequests.filter((req: any) => 
      !(req.email === email.toLowerCase() && req.resetCode === resetCode.toUpperCase())
    );
    localStorage.setItem('password-reset-requests', JSON.stringify(updatedRequests));
    
    setIsLoading(false);
    return true;
  };

  const checkUserPasswordStatus = (email: string): 'not_found' | 'needs_setup' | 'ready' => {
    const authorizedUsers = getAuthorizedUsers();
    const user = authorizedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return 'not_found';
    }
    
    // ✅ SEMPRE verificar se precisa configurar senhas DUPLAS - OBRIGATÓRIO
    if (!user.hasSetupPassword) {
      return 'needs_setup';
    }
    
    return 'ready';
  };

  // ✅ NOVA FUNÇÃO: Configurar senhas DUPLAS (Admin + Operador)
  const setupDualPasswords = async (
    email: string, 
    adminCredentials: UserCredentials, 
    operatorCredentials: UserCredentials
  ): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const authorizedUsers = getAuthorizedUsers();
    const userIndex = authorizedUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      setIsLoading(false);
      return false;
    }
    
    // ✅ Marcar como senhas configuradas - OBRIGATÓRIO
    authorizedUsers[userIndex].hasSetupPassword = true;
    localStorage.setItem('authorized-users', JSON.stringify(authorizedUsers));
    
    // ✅ Salvar AMBAS as credenciais - OBRIGATÓRIO
    const allCredentials = JSON.parse(localStorage.getItem('user-credentials') || '[]');
    
    // Credenciais do Administrador
    const adminUserCredentials = {
      email,
      username: adminCredentials.username,
      password: adminCredentials.password,
      role: 'admin',
      setupDate: new Date()
    };
    
    // Credenciais do Operador
    const operatorUserCredentials = {
      email,
      username: operatorCredentials.username,
      password: operatorCredentials.password,
      role: 'operator',
      setupDate: new Date()
    };
    
    // Remover credenciais antigas se existirem
    const filteredCredentials = allCredentials.filter((cred: any) => cred.email !== email);
    
    // Adicionar as novas credenciais
    filteredCredentials.push(adminUserCredentials, operatorUserCredentials);
    localStorage.setItem('user-credentials', JSON.stringify(filteredCredentials));
    
    // ✅ Fazer login automático como ADMINISTRADOR após configurar senhas
    const userSession: User = {
      id: Date.now().toString(),
      username: adminCredentials.username,
      name: authorizedUsers[userIndex].fullName,
      role: 'admin', // ✅ Login automático como admin
      businessId: 'default',
      email,
      hasCustomPassword: true
    };
    
    setUser(userSession);
    setPendingPasswordUser(null);
    localStorage.setItem('current-user', JSON.stringify(userSession));
    setIsLoading(false);
    return true;
  };

  // Funções do sistema normal - versão atualizada
  const login = async (email: string, username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ✅ Verificar se usuário tem credenciais personalizadas OBRIGATÓRIAS
    const allCredentials = JSON.parse(localStorage.getItem('user-credentials') || '[]');
    const userCredentials = allCredentials.find((cred: any) => 
      cred.email === email && 
      cred.username === username && 
      cred.password === password
    );

    if (userCredentials) {
      const authorizedUsers = getAuthorizedUsers();
      const authorizedUser = authorizedUsers.find(u => u.email === email);
      
      if (!authorizedUser) {
        setIsLoading(false);
        return false;
      }
      
      const userSession: User = {
        id: Date.now().toString(),
        username: userCredentials.username,
        name: authorizedUser.fullName,
        role: userCredentials.role, // ✅ admin ou operator OBRIGATÓRIO
        businessId: 'default',
        email: userCredentials.email,
        hasCustomPassword: true
      };
      
      setUser(userSession);
      localStorage.setItem('current-user', JSON.stringify(userSession));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  // Funções de estabelecimentos
  const getBusinesses = (): BusinessInfo[] => {
    const businesses = localStorage.getItem('businesses');
    if (businesses) {
      return JSON.parse(businesses).map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt)
      }));
    }
    return [];
  };

  const createBusiness = async (businessData: Omit<BusinessInfo, 'id' | 'createdAt'>): Promise<string> => {
    const businesses = getBusinesses();
    const newBusiness: BusinessInfo = {
      ...businessData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    businesses.push(newBusiness);
    localStorage.setItem('businesses', JSON.stringify(businesses));
    
    return newBusiness.id;
  };

  const logout = () => {
    setUser(null);
    setIsSuperAdmin(false);
    setPendingPasswordUser(null);
    localStorage.removeItem('current-user');
    localStorage.removeItem('super-admin-session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      setupDualPasswords, // ✅ Nova função para configurar senhas duplas
      checkUserPasswordStatus,
      requestPasswordReset,
      resetPassword,
      validateResetCode,
      pendingPasswordUser,
      logout, 
      isLoading, 
      isSuperAdmin,
      superAdminLogin,
      requestAccess,
      getAccessRequests,
      getAuthorizedUsers,
      getRestrictedUsers,
      approveAccess,
      rejectAccess,
      checkEmailAccess,
      restrictAccess,
      readmitUser,
      deleteUser,
      getBusinesses,
      createBusiness
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}