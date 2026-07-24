import { useState, useEffect } from 'react';
import {
  loadDatabaseFromStorage,
  saveDatabaseToStorage,
  resetDatabaseToDefault,
  exportDatabaseJSON,
  importDatabaseJSON
} from '../services/dbService';

export const useDatabase = () => {
  const [db, setDb] = useState(() => loadDatabaseFromStorage());

  const saveDatabase = (newDb) => {
    setDb(newDb);
    saveDatabaseToStorage(newDb);
  };

  const resetDatabase = () => {
    const defaultDb = resetDatabaseToDefault();
    setDb(defaultDb);
    return defaultDb;
  };

  const exportDatabase = () => {
    return exportDatabaseJSON(db);
  };

  const importDatabase = (jsonData) => {
    const newDb = importDatabaseJSON(jsonData);
    setDb(newDb);
    return newDb;
  };

  const updateDatabase = (updates) => {
    const newDb = { ...db, ...updates };
    setDb(newDb);
    saveDatabaseToStorage(newDb);
  };

  return {
    db,
    setDb,
    saveDatabase,
    resetDatabase,
    exportDatabase,
    importDatabase,
    updateDatabase
  };
};
