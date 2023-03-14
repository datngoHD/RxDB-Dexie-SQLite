import './src/shim';
import 'react-native-get-random-values';
import React, {useEffect, useState} from 'react';
import initializeDb from './src/initializeDb';
import {AppContext} from './src/app-context';
import Heroes from './src/heroes';

export const App = () => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      const _db = await initializeDb();
      setDb(_db);
    };
    initDB().then();
  }, []);

  return (
    <AppContext.Provider value={{db}}>
      <Heroes />
    </AppContext.Provider>
  );
};

export default App;
