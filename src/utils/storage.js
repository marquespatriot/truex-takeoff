import { SAMPLE_PROJECT } from '../constants/defaultData';

const STORAGE_KEY = 'truex_takeoff_projects_v2';
const ACTIVE_PROJECT_KEY = 'truex_takeoff_active_id_v2';

export const loadProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [SAMPLE_PROJECT];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(ACTIVE_PROJECT_KEY, SAMPLE_PROJECT.id);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [SAMPLE_PROJECT];
    }
    return parsed;
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return [SAMPLE_PROJECT];
  }
};

export const saveProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
};

export const getActiveProjectId = () => {
  return localStorage.getItem(ACTIVE_PROJECT_KEY) || SAMPLE_PROJECT.id;
};

export const setActiveProjectId = (id) => {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
};

export const createNewProject = (infoOverides = {}, template = 'RESIDENTIAL') => {
  const now = new Date().toISOString();
  const newProj = {
    id: `proj_${Date.now()}`,
    template: template,
    info: {
      customerName: infoOverides.customerName || 'New Customer',
      customerEmail: infoOverides.customerEmail || '',
      customerPhone: infoOverides.customerPhone || '',
      address: infoOverides.address || '',
      salesRep: infoOverides.salesRep || 'Field Estimator',
      estimator: infoOverides.estimator || infoOverides.salesRep || 'Field Estimator',
      date: now.split('T')[0],
      createdAt: now,
      updatedAt: now,
      status: 'Measuring',
      projectCondition: 'New Construction',
      jobTypes: ['Spray Foam'],
      ceilingHeight: '9 ft',
      notes: infoOverides.notes || '',
      photos: []
    },
    settings: {
      wasteFactor: '0%',
      displayMode: 'net',
      favorites: []
    },
    measurements: {},
    buildings: [],
    units: [],
    customSections: [],
    auditLog: [
      { id: `a_${Date.now()}`, user: infoOverides.salesRep || 'Estimator', action: 'Created project takeoff', timestamp: now }
    ]
  };
  return newProj;
};
