import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import AreaSelector from './components/AreaSelector';
import HierarchyManager from './components/HierarchyManager';
import MeasurementCalculator from './components/MeasurementCalculator';
import ProjectSummary from './components/ProjectSummary';
import SavedProjects from './components/SavedProjects';
import ProjectInfoModal from './components/ProjectInfoModal';
import CustomAreaModal from './components/CustomAreaModal';
import PhotoGalleryModal from './components/PhotoGalleryModal';
import AuditLogModal from './components/AuditLogModal';

import { useAuth } from './context/AuthContext';

import { 
  loadProjects, 
  saveProjects, 
  getActiveProjectId, 
  setActiveProjectId, 
  createNewProject 
} from './utils/storage';

import { DEFAULT_SECTIONS } from './constants/defaultData';
import { getProjectGrandTotals } from './utils/calculations';

export default function App() {
  const { token, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState(() => loadProjects());
  const [activeProjectId, setActiveId] = useState(() => getActiveProjectId());
  
  const [activeTab, setActiveTab] = useState('calculator');
  const [activeSectionId, setActiveSectionId] = useState('first_floor');
  const [activeCategoryId, setActiveCategoryId] = useState('ext_walls');

  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [activeUnitId, setActiveUnitId] = useState(null);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState('dark');

  // Connection & Sync States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState('saved'); // 'saved', 'saving', 'syncing', 'offline'

  const syncTimeoutRef = useRef(null);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('syncing');
      syncProjectsWithCloud(projects);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [projects]);

  // Initial Cloud DB Fetch on Auth
  useEffect(() => {
    if (isAuthenticated && token && navigator.onLine) {
      fetchCloudProjects();
    }
  }, [isAuthenticated, token]);

  const fetchCloudProjects = async () => {
    try {
      setConnectionStatus('syncing');
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          saveProjects(data.projects);
          if (!data.projects.some(p => p.id === activeProjectId)) {
            setActiveId(data.projects[0].id);
            setActiveProjectId(data.projects[0].id);
          }
        }
        setConnectionStatus('saved');
      } else {
        setConnectionStatus('saved');
      }
    } catch (err) {
      console.warn('Cloud DB fetch fallback to local storage:', err);
      setConnectionStatus('offline');
    }
  };

  const syncProjectsWithCloud = async (projectsToSync) => {
    if (!token || !navigator.onLine) {
      setConnectionStatus('offline');
      return;
    }

    try {
      setConnectionStatus('saving');
      const response = await fetch('/api/projects/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projects: projectsToSync })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.projects) {
          setProjects(data.projects);
          saveProjects(data.projects);
        }
        setConnectionStatus('saved');
      } else {
        setConnectionStatus('offline');
      }
    } catch (err) {
      console.warn('Cloud DB sync offline fallback:', err);
      setConnectionStatus('offline');
    }
  };

  // Active Project Object
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const allSections = [
    ...DEFAULT_SECTIONS,
    ...(activeProject?.customSections || [])
  ];

  // Auto-save & Cloud Sync Handler
  const updateActiveProject = (updaterFn, auditActionText = null) => {
    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        if (p.id === activeProjectId) {
          const newProj = typeof updaterFn === 'function' ? updaterFn(p) : { ...p, ...updaterFn };
          newProj.info = {
            ...newProj.info,
            updatedAt: new Date().toISOString()
          };
          if (auditActionText) {
            const logItem = {
              id: `a_${Date.now()}`,
              user: newProj.info?.estimator || newProj.info?.salesRep || 'Estimator',
              action: auditActionText,
              timestamp: new Date().toISOString()
            };
            newProj.auditLog = [...(newProj.auditLog || []), logItem];
          }
          return newProj;
        }
        return p;
      });

      // 1. Instant local persistence
      saveProjects(updated);

      // 2. Debounced Cloud DB Sync
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      setConnectionStatus('saving');

      syncTimeoutRef.current = setTimeout(() => {
        syncProjectsWithCloud(updated);
      }, 600);

      return updated;
    });
  };

  const grandTotals = getProjectGrandTotals(activeProject, allSections);

  const currentSection = allSections.find(s => s.id === activeSectionId) || allSections[0];
  const currentCategory = currentSection?.categories.find(c => c.id === activeCategoryId) || currentSection?.categories[0];

  const hierarchyPrefix = `${activeBuildingId ? `b:${activeBuildingId}:` : ''}${activeUnitId ? `u:${activeUnitId}:` : ''}`;
  const currentMeasurementKey = `${hierarchyPrefix}${activeSectionId}:${activeCategoryId}`;

  const currentCategoryData = activeProject?.measurements?.[currentMeasurementKey] || { 
    items: [], 
    notes: '', 
    framing: '', 
    material: '', 
    thickness: '',
    photos: [] 
  };

  const favoritesList = activeProject?.settings?.favorites || [];
  const isCurrentFavorite = favoritesList.includes(currentMeasurementKey);

  const handleSelectArea = (sectionId, categoryId) => {
    setActiveSectionId(sectionId);
    if (categoryId) {
      setActiveCategoryId(categoryId);
    } else {
      const sec = allSections.find(s => s.id === sectionId);
      if (sec && sec.categories.length > 0) {
        setActiveCategoryId(sec.categories[0].id);
      }
    }
  };

  // Measurement Handlers
  const handleAddMeasurement = (item) => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            items: [...currentData.items, item]
          }
        }
      };
    }, `Added measurement: ${item.label} (${item.sqft} sqft)`);
  };

  const handleUpdateMeasurement = (updatedItem) => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            items: currentData.items.map(it => it.id === updatedItem.id ? updatedItem : it)
          }
        }
      };
    }, `Updated measurement: ${updatedItem.label}`);
  };

  const handleDeleteMeasurement = (itemId) => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            items: currentData.items.filter(it => it.id !== itemId)
          }
        }
      };
    }, `Deleted measurement entry`);
  };

  const handleUndoLastMeasurement = () => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      if (!currentData.items || currentData.items.length === 0) return proj;

      const updatedItems = currentData.items.slice(0, -1);
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            items: updatedItems
          }
        }
      };
    }, `Undid last measurement entry`);
  };

  const handleDuplicateMeasurement = (item) => {
    const duplicated = {
      ...item,
      id: `m_${Date.now()}`,
      label: item.label ? `${item.label} (Copy)` : 'Copy'
    };
    handleAddMeasurement(duplicated);
  };

  const handleUpdateAreaMeta = (metaObj) => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            ...metaObj
          }
        }
      };
    });
  };

  const handleUpdateNotes = (newNotes) => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            notes: newNotes
          }
        }
      };
    });
  };

  // Cloud Photo Upload Handler
  const handleAddAreaPhoto = async (photoObj) => {
    let finalPhoto = photoObj;

    // Upload base64 image to server cloud storage if online
    if (token && navigator.onLine && photoObj.url && photoObj.url.startsWith('data:')) {
      try {
        const res = await fetch('/api/photos/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ imageBase64: photoObj.url, caption: photoObj.caption })
        });
        if (res.ok) {
          const cloudRes = await res.json();
          finalPhoto = cloudRes;
        }
      } catch (err) {
        console.warn('Cloud photo upload fallback to local base64:', err);
      }
    }

    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            photos: [...(currentData.photos || []), finalPhoto]
          }
        }
      };
    }, `Attached photo to ${currentCategory?.name}`);
  };

  const handleDeleteAreaPhoto = (photoId) => {
    updateActiveProject(proj => {
      const currentData = proj.measurements[currentMeasurementKey] || { items: [], notes: '' };
      return {
        ...proj,
        measurements: {
          ...proj.measurements,
          [currentMeasurementKey]: {
            ...currentData,
            photos: (currentData.photos || []).filter(p => p.id !== photoId)
          }
        }
      };
    });
  };

  // Custom Area / Story Level
  const handleAddCustomArea = (newSection) => {
    updateActiveProject(proj => ({
      ...proj,
      customSections: [...(proj.customSections || []), newSection]
    }), `Created custom area: ${newSection.name}`);

    setActiveSectionId(newSection.id);
    if (newSection.categories.length > 0) {
      setActiveCategoryId(newSection.categories[0].id);
    }
  };

  const handleDeleteCustomSection = (sectionId) => {
    updateActiveProject(proj => ({
      ...proj,
      customSections: (proj.customSections || []).filter(s => s.id !== sectionId)
    }), `Deleted section`);

    if (activeSectionId === sectionId) {
      setActiveSectionId('first_floor');
      setActiveCategoryId('ext_walls');
    }
  };

  // Hierarchy Handlers
  const handleAddBuilding = (buildingName) => {
    const newB = { id: `b_${Date.now()}`, name: buildingName };
    updateActiveProject(proj => ({
      ...proj,
      buildings: [...(proj.buildings || []), newB]
    }), `Added Building: ${buildingName}`);
    setActiveBuildingId(newB.id);
  };

  const handleAddUnit = (unitName) => {
    const newU = { id: `u_${Date.now()}`, name: unitName, buildingId: activeBuildingId };
    updateActiveProject(proj => ({
      ...proj,
      units: [...(proj.units || []), newU]
    }), `Added Dwelling Unit: ${unitName}`);
    setActiveUnitId(newU.id);
  };

  const handleDuplicateUnit = (unitObj) => {
    const newUnitId = `u_${Date.now()}`;
    const newUnitName = `${unitObj.name} (Copy)`;
    const prefixOld = `u:${unitObj.id}:`;
    const prefixNew = `u:${newUnitId}:`;

    updateActiveProject(proj => {
      const newMeasurements = { ...proj.measurements };
      Object.keys(proj.measurements).forEach(k => {
        if (k.startsWith(prefixOld)) {
          const newKey = k.replace(prefixOld, prefixNew);
          newMeasurements[newKey] = JSON.parse(JSON.stringify(proj.measurements[k]));
        }
      });
      return {
        ...proj,
        units: [...(proj.units || []), { id: newUnitId, name: newUnitName, buildingId: unitObj.buildingId }],
        measurements: newMeasurements
      };
    }, `Duplicated Unit: ${unitObj.name}`);
  };

  // Favorite Areas
  const handleToggleFavorite = () => {
    updateActiveProject(proj => {
      const currentFavs = proj.settings?.favorites || [];
      const updated = currentFavs.includes(currentMeasurementKey)
        ? currentFavs.filter(k => k !== currentMeasurementKey)
        : [...currentFavs, currentMeasurementKey];
      return {
        ...proj,
        settings: {
          ...(proj.settings || {}),
          favorites: updated
        }
      };
    });
  };

  // Project Info
  const handleSaveProjectInfo = (newFormData) => {
    updateActiveProject(proj => ({
      ...proj,
      template: newFormData.template || proj.template,
      info: {
        ...proj.info,
        customerName: newFormData.customerName,
        customerEmail: newFormData.customerEmail,
        customerPhone: newFormData.customerPhone,
        address: newFormData.address,
        salesRep: newFormData.salesRep,
        estimator: newFormData.estimator || newFormData.salesRep,
        date: newFormData.date,
        status: newFormData.status,
        projectCondition: newFormData.projectCondition,
        jobTypes: newFormData.jobTypes,
        ceilingHeight: newFormData.ceilingHeight,
        notes: newFormData.notes,
        locationCoords: newFormData.locationCoords
      },
      settings: {
        ...(proj.settings || {}),
        wasteFactor: newFormData.wasteFactor || '0%'
      }
    }), `Updated project parameters`);
  };

  // New Project
  const handleNewProject = () => {
    const newProj = createNewProject();
    const updatedProjects = [newProj, ...projects];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setActiveId(newProj.id);
    setActiveProjectId(newProj.id);
    setIsInfoModalOpen(true);
    setActiveTab('calculator');
    syncProjectsWithCloud(updatedProjects);
  };

  const handleDuplicateProject = (projToDuplicate) => {
    const duplicated = {
      ...JSON.parse(JSON.stringify(projToDuplicate)),
      id: `proj_${Date.now()}`,
      info: {
        ...projToDuplicate.info,
        customerName: `${projToDuplicate.info.customerName} (Copy)`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    const updatedProjects = [duplicated, ...projects];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setActiveId(duplicated.id);
    setActiveProjectId(duplicated.id);
    syncProjectsWithCloud(updatedProjects);
  };

  const handleDeleteProject = (projIdToDelete) => {
    const updatedProjects = projects.filter(p => p.id !== projIdToDelete);
    if (updatedProjects.length === 0) {
      const fresh = createNewProject();
      setProjects([fresh]);
      saveProjects([fresh]);
      setActiveId(fresh.id);
      setActiveProjectId(fresh.id);
      syncProjectsWithCloud([fresh]);
    } else {
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      if (activeProjectId === projIdToDelete) {
        setActiveId(updatedProjects[0].id);
        setActiveProjectId(updatedProjects[0].id);
      }
      syncProjectsWithCloud(updatedProjects);
    }
  };

  const handleOpenProject = (id) => {
    setActiveId(id);
    setActiveProjectId(id);
    setActiveTab('calculator');
  };

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-zinc-950 text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col font-sans`}>
      
      {/* Header */}
      <Header
        activeProject={activeProject}
        grandTotals={grandTotals}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProject={handleNewProject}
        onEditProjectInfo={() => setIsInfoModalOpen(true)}
        onOpenAuditLog={() => setIsAuditLogModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        connectionStatus={connectionStatus}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: TAKEOFF CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Building & Unit Selector Drawer */}
            <HierarchyManager
              project={activeProject}
              activeBuildingId={activeBuildingId}
              activeUnitId={activeUnitId}
              onSelectBuilding={setActiveBuildingId}
              onSelectUnit={setActiveUnitId}
              onAddBuilding={handleAddBuilding}
              onAddUnit={handleAddUnit}
              onDuplicateUnit={handleDuplicateUnit}
            />

            {/* Floor & Category Navigator */}
            <AreaSelector
              allSections={allSections}
              activeSectionId={activeSectionId}
              activeCategoryId={activeCategoryId}
              onSelectArea={handleSelectArea}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
              onDeleteCustomSection={handleDeleteCustomSection}
              project={activeProject}
            />

            {/* Main Calculator */}
            <MeasurementCalculator
              activeSection={currentSection}
              activeCategory={currentCategory}
              categoryData={currentCategoryData}
              onAddMeasurement={handleAddMeasurement}
              onUpdateMeasurement={handleUpdateMeasurement}
              onDeleteMeasurement={handleDeleteMeasurement}
              onDuplicateMeasurement={handleDuplicateMeasurement}
              onUndoLastMeasurement={handleUndoLastMeasurement}
              onUpdateAreaMeta={handleUpdateAreaMeta}
              onUpdateNotes={handleUpdateNotes}
              onOpenAreaPhotos={() => setIsPhotosModalOpen(true)}
              wasteFactor={activeProject?.settings?.wasteFactor || '0%'}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* TAB 2: PROJECT SUMMARY REPORT */}
        {activeTab === 'summary' && (
          <div className="animate-fadeIn">
            <ProjectSummary
              project={activeProject}
              allSections={allSections}
              onOpenEditInfo={() => setIsInfoModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: PROJECT INFO VIEW */}
        {activeTab === 'info' && (
          <div className="animate-fadeIn max-w-3xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Project & Customer Record</h2>
                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black text-xs shadow"
                >
                  Edit Project Setup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-black p-4 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Customer Name</span>
                  <p className="text-lg font-extrabold text-lime-400">{activeProject?.info?.customerName || 'N/A'}</p>
                </div>

                <div className="bg-black p-4 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Estimator / Sales Rep</span>
                  <p className="text-lg font-extrabold text-white">{activeProject?.info?.estimator || activeProject?.info?.salesRep || 'N/A'}</p>
                </div>

                <div className="bg-black p-4 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Email Address</span>
                  <p className="text-base font-semibold text-zinc-200">{activeProject?.info?.customerEmail || 'N/A'}</p>
                </div>

                <div className="bg-black p-4 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Phone Number</span>
                  <p className="text-base font-semibold text-zinc-200">{activeProject?.info?.customerPhone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-black p-4 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase">Project Address</span>
                <p className="text-base font-semibold text-white mt-1">{activeProject?.info?.address || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-black p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold">Project Condition:</span>
                  <p className="text-white font-bold">{activeProject?.info?.projectCondition}</p>
                </div>

                <div className="bg-black p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold">Waste Factor:</span>
                  <p className="text-lime-400 font-extrabold">{activeProject?.settings?.wasteFactor || '0%'}</p>
                </div>

                <div className="bg-black p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold">Ceiling Height:</span>
                  <p className="text-white font-bold">{activeProject?.info?.ceilingHeight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAVED PROJECTS LIST */}
        {activeTab === 'projects' && (
          <div className="animate-fadeIn">
            <SavedProjects
              projects={projects}
              activeProjectId={activeProjectId}
              onOpenProject={handleOpenProject}
              onNewProject={handleNewProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        )}

      </main>

      {/* Modals */}
      <ProjectInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        projectInfo={activeProject?.info}
        projectSettings={activeProject?.settings}
        projectTemplate={activeProject?.template}
        onSave={handleSaveProjectInfo}
      />

      <CustomAreaModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddCustomArea={handleAddCustomArea}
      />

      <PhotoGalleryModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        title={`${currentCategory?.name || 'Area'} Photos`}
        photos={currentCategoryData.photos || []}
        onAddPhoto={handleAddAreaPhoto}
        onDeletePhoto={handleDeleteAreaPhoto}
      />

      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        auditLog={activeProject?.auditLog || []}
      />

    </div>
  );
}
