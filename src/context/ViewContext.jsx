import { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

export function ViewProvider({ children }) {
  // Default ke mobile jika layar kecil, atau desktop jika layar lebar
  const [viewMode, setViewMode] = useState(() => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1280) return 'tablet';
    return 'desktop';
  });

  // Sinkronisasi otomatis hanya saat inisialisasi awal atau jika user tidak memilih manual
  // Namun user bisa meng-override kapan saja melalui switcher

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode }}>
      <div className={`mode-${viewMode} h-full w-full`}>
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
