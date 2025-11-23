
import { AnnouncerStyle, AnnouncerGender } from './geminiService';

export interface HistoryItem {
  id: string;
  originalText: string;
  generatedScript: string;
  style: AnnouncerStyle;
  gender: AnnouncerGender;
  timestamp: number;
  user: string;
  likes: number;
}

const STORAGE_KEY = 'voz_gala_history_v1';

// Mock data for "Global Feed" simulation
const MOCK_USERS = [
  "Ana G.", "Carlos R.", "StudioX", "EventoPro", "DjMax"
];

const MOCK_SCRIPTS = [
  "¡Damas y caballeros, bienvenidos al espectáculo más grande de la tierra!",
  "A continuación, presentamos al innovador del año en tecnología cuántica.",
  "¡Prepárense para el impacto! ¡El campeón ha llegado!",
  "Informe financiero del tercer trimestre: Crecimiento sostenido.",
  "Por favor, diríjanse a la puerta de embarque número 5.",
];

/**
 * Saves a generation to local history.
 */
export const saveToHistory = (
  originalText: string, 
  generatedScript: string, 
  style: AnnouncerStyle, 
  gender: AnnouncerGender,
  userName: string
): HistoryItem => {
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    originalText,
    generatedScript,
    style,
    gender,
    timestamp: Date.now(),
    user: userName,
    likes: 0
  };

  try {
    const existing = getHistory();
    const updated = [newItem, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving history", e);
  }
  
  return newItem;
};

/**
 * Retrieves local history.
 */
export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Generates a fake "Global Feed" item to simulate community activity.
 */
export const generateMockFeedItem = (): HistoryItem => {
  const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
  const randomScript = MOCK_SCRIPTS[Math.floor(Math.random() * MOCK_SCRIPTS.length)];
  
  // Random style including 'real'
  const styles: AnnouncerStyle[] = ['epic', 'professional', 'real'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  
  return {
    id: `mock-${Date.now()}`,
    originalText: "...",
    generatedScript: randomScript,
    style: randomStyle,
    gender: 'male', // Default for mock
    timestamp: Date.now(),
    user: randomUser,
    likes: Math.floor(Math.random() * 50)
  };
};