import { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();
const STORAGE_KEY = 'propsuite-view-mode';

function getInitialViewMode() {
  if (typeof window === 'undefined') return 'mobile';

  const savedMode = window.localStorage.getItem(STORAGE_KEY);
  if (['mobile', 'tablet', 'desktop'].includes(savedMode)) {
    return savedMode;
  }

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1180) return 'tablet';
  return 'desktop';
}

export function ViewProvider({ children }) {
  const [viewMode, setViewMode] = useState(getInitialViewMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode }}>
      <div className={`mode-${viewMode} h-full w-full`} data-view-mode={viewMode}>
        {children}
      </div>
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}
