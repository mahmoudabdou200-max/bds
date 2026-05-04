import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'bds_profile';
const DESIGNS_KEY = 'bds_designs';
const THEME_KEY = 'bds_theme';

const initialProfile = {
  id: crypto.randomUUID?.() || Date.now().toString(),
  name: '',
  xp: 0,
  level: 1,
  badges: [],
  unlockedCountries: ['saudi'],
  totalSimulations: 0,
  bestScores: {},
  bestSustainability: 0,
  bestQuakeJapan: 0,
  bestColdCanada: 0,
  bestWaterNetherlands: 0,
  bestHardCountryScore: 0,
  withinBudget5Pct: false,
  underBudget50Pct: false,
  maxRedesigns: 0,
  fastestDesign: Infinity,
  perfectScoreCount: 0,
  tutorialCompleted: false,
};

const initialDesign = {
  countryId: null,
  buildingTypeId: null,
  season: 'summer',
  wallId: null,
  roofId: null,
  foundationId: null,
  featureIds: [],
  startTime: null,
  attemptNumber: 1,
};

function getLevel(xp) {
  const levels = [
    { level: 1, xp: 0 },
    { level: 2, xp: 125 },
    { level: 3, xp: 375 },
    { level: 4, xp: 750 },
    { level: 5, xp: 1250 },
    { level: 6, xp: 2000 },
    { level: 7, xp: 3000 },
    { level: 8, xp: 4250 },
    { level: 9, xp: 5750 },
    { level: 10, xp: 7750 },
    { level: 11, xp: 9750 },
    { level: 12, xp: 12250 },
    { level: 13, xp: 15250 },
    { level: 14, xp: 18750 },
    { level: 15, xp: 23750 },
    { level: 16, xp: 28750 },
    { level: 17, xp: 34750 },
    { level: 18, xp: 41750 },
    { level: 19, xp: 49750 },
    { level: 20, xp: 59750 },
  ];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) return levels[i].level;
  }
  return 1;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_COUNTRY':
      return { ...state, design: { ...state.design, countryId: action.payload, wallId: null, roofId: null, foundationId: null, featureIds: [] } };
    case 'SET_BUILDING_TYPE':
      return { ...state, design: { ...state.design, buildingTypeId: action.payload, wallId: null, roofId: null, foundationId: null, featureIds: [] } };
    case 'SET_SEASON':
      return { ...state, design: { ...state.design, season: action.payload } };
    case 'SET_WALL':
      return { ...state, design: { ...state.design, wallId: action.payload } };
    case 'SET_ROOF':
      return { ...state, design: { ...state.design, roofId: action.payload } };
    case 'SET_FOUNDATION':
      return { ...state, design: { ...state.design, foundationId: action.payload } };
    case 'TOGGLE_FEATURE': {
      const ids = state.design.featureIds;
      const newIds = ids.includes(action.payload)
        ? ids.filter(id => id !== action.payload)
        : [...ids, action.payload];
      return { ...state, design: { ...state.design, featureIds: newIds } };
    }
    case 'ADD_FEATURE': {
      const ids = state.design.featureIds;
      if (ids.includes(action.payload)) return state;
      return { ...state, design: { ...state.design, featureIds: [...ids, action.payload] } };
    }
    case 'REMOVE_FEATURE': {
      const ids = state.design.featureIds.filter(id => id !== action.payload);
      return { ...state, design: { ...state.design, featureIds: ids } };
    }
    case 'SET_FEATURES':
      return { ...state, design: { ...state.design, featureIds: action.payload } };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'INCREMENT_ATTEMPT':
      return { ...state, design: { ...state.design, attemptNumber: state.design.attemptNumber + 1 } };
    case 'START_TIMER':
      return { ...state, design: { ...state.design, startTime: Date.now() } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload, level: getLevel((state.profile.xp + (action.payload.xp || 0))) } };
    case 'ADD_XP': {
      const newXp = state.profile.xp + action.payload;
      return { ...state, profile: { ...state.profile, xp: newXp, level: getLevel(newXp) } };
    }
    case 'ADD_BADGE': {
      if (state.profile.badges.includes(action.payload)) return state;
      return { ...state, profile: { ...state.profile, badges: [...state.profile.badges, action.payload] } };
    }
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'RESET_DESIGN':
      return { ...state, design: { ...initialDesign, startTime: Date.now() }, results: null };
    case 'SET_DESIGN':
      return { ...state, design: action.payload };
    case 'SAVE_DESIGN':
      return { ...state, savedDesigns: [...state.savedDesigns, action.payload] };
    case 'DELETE_DESIGN':
      return { ...state, savedDesigns: state.savedDesigns.filter(d => d.id !== action.payload) };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function loadDesigns() {
  try {
    const saved = localStorage.getItem(DESIGNS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

export function AppProvider({ children }) {
  const savedProfile = loadProfile();

  function initState() {
    const savedTheme = (() => { try { return localStorage.getItem(THEME_KEY) || 'light'; } catch { return 'light'; } })();
    return {
      profile: savedProfile ? { ...initialProfile, ...savedProfile } : { ...initialProfile },
      design: { ...initialDesign, startTime: Date.now() },
      results: null,
      savedDesigns: loadDesigns(),
      theme: savedTheme,
    };
  }

  const [state, dispatch] = useReducer(reducer, undefined, initState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
  }, [state.profile]);

  useEffect(() => {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(state.savedDesigns));
  }, [state.savedDesigns]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export { initialProfile, initialDesign, getLevel };