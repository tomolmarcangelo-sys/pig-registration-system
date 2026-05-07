import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  assignedBarangay?: string;
}

export type PigStatus = 'Fattening' | 'Sow' | 'Boar' | 'Piglet' | 'Weaner' | 'Gilt';

export interface Pig {
  id: string;
  ownerName: string;
  birthDate: string;
  tagNumber: string;
  barangay: string;
  municipality: string;
  province: string;
  street: string;
  status: PigStatus;
  isArchived: boolean;
  registeredBy: string;
  createdAt: string;
}

export interface Barangay {
  id: string;
  name: string;
}

export interface HistoryEntry {
  id: string;
  pigId: string;
  action: 'created' | 'updated' | 'archived' | 'sold';
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  timestamp: string;
  details: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string; // For direct messages (admin/user)
  recipientBarangay?: string; // For broadcast (admin to barangay)
  subject: string;
  content: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  createdAt: string;
  type: 'request' | 'feedback' | 'broadcast'; // request: user to admin, feedback: user to admin, broadcast: admin to barangay
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'file' | 'photo' | 'video';
  dataUrl: string; // Base64 or file path
  size: number; // bytes
}

export interface Draft {
  id: string;
  type: 'pig' | 'message';
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  
  pigs: Pig[];
  addPig: (pig: Omit<Pig, 'id' | 'createdAt' | 'municipality' | 'province' | 'isArchived'>) => void;
  updatePig: (id: string, updates: Partial<Pig>) => void;
  sellPig: (id: string) => void;
  deleteBarangay: (id: string) => void;
  
  barangays: Barangay[];
  addBarangay: (name: string) => void;
  updateBarangay: (id: string, name: string) => void;
  
  // History
  history: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
  
  // Messages
  messages: Message[];
  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  markMessageAsRead: (messageId: string) => void;
  
  // Drafts
  drafts: Draft[];
  saveDraft: (type: 'pig' | 'message', data: Record<string, any>) => void;
  deleteDraft: (draftId: string) => void;
}

// --- Initial Data ---

const INITIAL_BARANGAY_NAMES = [
  "Ambacon", "Badiangon", "Bangcas A", "Bangcas B", "Biasong", "Bugho", "Calag-itan", 
  "Calayugan", "Calinao", "Canipaa", "Catublian", "Ilaya", "Ingan", "Laboon", "Ma-asin", 
  "Manalic", "Manalog", "Manlayag", "Matin-ao", "Nava", "Nueva Esperanza", "Otama", 
  "Palongpong", "Panalaron", "Patong", "Poblacion", "Pondol", "Salog", "Salvacion", 
  "San Pablo", "San Pedro", "Santo Niño I", "Santo Niño II", "Tahusan", "Talisay", 
  "Tawog", "Tibungco", "Tuburan", "Union"
];

const INITIAL_BARANGAYS: Barangay[] = INITIAL_BARANGAY_NAMES.map(name => ({ id: uuidv4(), name }));

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: '2', username: 'user', password: 'user123', role: 'user', name: 'Regular User', assignedBarangay: 'Poblacion' }
];

// --- Context ---

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const loadFromStorage = <T,>(key: string, initial: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch (e) {
      console.error(`Error loading ${key}`, e);
      return initial;
    }
  };

  const [barangays, setBarangays] = useState<Barangay[]>(() => 
    loadFromStorage('barangays', INITIAL_BARANGAYS)
  );

  const [users, setUsers] = useState<User[]>(() => 
    loadFromStorage('users', INITIAL_USERS)
  );

  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    loadFromStorage('currentUser', null)
  );

  const [pigs, setPigs] = useState<Pig[]>(() => 
    loadFromStorage('pigs', [])
  );

  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadFromStorage('history', [])
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage('messages', [])
  );

  const [drafts, setDrafts] = useState<Draft[]>(() =>
    loadFromStorage('drafts', [])
  );

  // Persistence
  useEffect(() => localStorage.setItem('currentUser', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('pigs', JSON.stringify(pigs)), [pigs]);
  useEffect(() => localStorage.setItem('barangays', JSON.stringify(barangays)), [barangays]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('drafts', JSON.stringify(drafts)), [drafts]);

  const login = (u: string, p: string) => {
    const user = users.find(user => user.username === u && user.password === p);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: uuidv4() };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const addPig = (pigData: Omit<Pig, 'id' | 'createdAt' | 'municipality' | 'province' | 'isArchived'>) => {
    const newPig: Pig = {
      ...pigData,
      id: uuidv4(),
      municipality: 'Hinunangan',
      province: 'Southern Leyte',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    setPigs([...pigs, newPig]);

    // Add history entry
    if (currentUser) {
      addHistoryEntry({
        pigId: newPig.id,
        action: 'created',
        newValue: newPig.tagNumber,
        changedBy: currentUser.id,
        timestamp: new Date().toISOString(),
        details: `Pig registered: ${newPig.ownerName} - ${newPig.tagNumber}`
      });
    }
  };

  const updatePig = (id: string, updates: Partial<Pig>) => {
    const oldPig = pigs.find(p => p.id === id);
    setPigs(pigs.map(p => p.id === id ? { ...p, ...updates } : p));

    if (oldPig && currentUser) {
      const changedFields = Object.keys(updates).filter(key => oldPig[key as keyof Pig] !== updates[key as keyof Pig]);
      addHistoryEntry({
        pigId: id,
        action: 'updated',
        oldValue: JSON.stringify(changedFields),
        newValue: JSON.stringify(updates),
        changedBy: currentUser.id,
        timestamp: new Date().toISOString(),
        details: `Updated fields: ${changedFields.join(', ')}`
      });
    }
  };

  const sellPig = (id: string) => {
    updatePig(id, { isArchived: true });
    if (currentUser) {
      addHistoryEntry({
        pigId: id,
        action: 'sold',
        changedBy: currentUser.id,
        timestamp: new Date().toISOString(),
        details: 'Pig archived/sold'
      });
    }
  };

  const addBarangay = (name: string) => {
    setBarangays([...barangays, { id: uuidv4(), name }]);
  };

  const updateBarangay = (id: string, name: string) => {
    setBarangays(barangays.map(b => b.id === id ? { ...b, name } : b));
  };

  const deleteBarangay = (id: string) => {
    setBarangays(barangays.filter(b => b.id !== id));
  };

  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id'>) => {
    setHistory([...history, { ...entry, id: uuidv4() }]);
  };

  const sendMessage = (message: Omit<Message, 'id' | 'createdAt'>) => {
    setMessages([...messages, { ...message, id: uuidv4(), createdAt: new Date().toISOString() }]);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(messages.map(m => m.id === messageId ? { ...m, isRead: true } : m));
  };

  const saveDraft = (type: 'pig' | 'message', data: Record<string, any>) => {
    const existingDraftIndex = drafts.findIndex(d => d.type === type);
    const now = new Date().toISOString();

    if (existingDraftIndex >= 0) {
      const updated = [...drafts];
      updated[existingDraftIndex] = {
        ...updated[existingDraftIndex],
        data,
        updatedAt: now
      };
      setDrafts(updated);
    } else {
      setDrafts([...drafts, {
        id: uuidv4(),
        type,
        data,
        createdAt: now,
        updatedAt: now
      }]);
    }
  };

  const deleteDraft = (draftId: string) => {
    setDrafts(drafts.filter(d => d.id !== draftId));
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      users, addUser, updateUser,
      pigs, addPig, updatePig, sellPig, deleteBarangay,
      barangays, addBarangay, updateBarangay,
      history, addHistoryEntry,
      messages, sendMessage, markMessageAsRead,
      drafts, saveDraft, deleteDraft
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
