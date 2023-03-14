import {addRxPlugin, createRxDatabase} from 'rxdb';
import SQLite from 'react-native-sqlite-2';
import {RxDBDevModePlugin} from 'rxdb/plugins/dev-mode';
import {RxDBMigrationPlugin} from 'rxdb/plugins/migration';
import {RxDBUpdatePlugin} from 'rxdb/plugins/update';
import {RxDBQueryBuilderPlugin} from 'rxdb/plugins/query-builder';
import {replicateCouchDB} from 'rxdb/plugins/replication-couchdb';
import fetch from 'cross-fetch';
import {getRxStorageDexie} from 'rxdb/plugins/storage-dexie';
import {DexieOptions} from 'dexie';

import setGlobalVars from 'indexeddbshim/dist/indexeddbshim-noninvasive';

let win: DexieOptions = {};
setGlobalVars(win, {
  checkOrigin: false,
  win: SQLite,
  deleteDatabaseFiles: false,
  useSQLiteIndexes: true,
});

addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

import schema from './schema';

const syncURL = 'http://admin:mysecret1@localhost:5984'; // Replace with your couchdb instance
const dbName = 'heroesreactdatabase1';
export const HeroesCollectionName = 'heroes';

const getTenantShortNameFromUrl = (url: string) => {
  const pathParts = new URL(url).pathname.split('/');
  return pathParts[1];
};

const getReplicationIdentifierFromUrl = (url: string, entity: string) => {
  if (url === '') {
    return entity;
  }

  const hostname = new URL(url).hostname;
  const tenantShortName = getTenantShortNameFromUrl(url);
  return `${hostname}/${tenantShortName}/${entity}`;
};

const initialize = async () => {
  if (process.env.NODE_ENV !== 'production') {
    // addRxPlugin(RxDBDevModePlugin);
  }

  let db;

  try {
    console.log('Initializing database...');
    db = await createRxDatabase({
      name: dbName,
      storage: getRxStorageDexie({
        indexedDB: win.indexedDB,
        IDBKeyRange: win.IDBKeyRange,
      }),
      multiInstance: false,
      ignoreDuplicate: true,
    });

    console.log('Database initialized!');
  } catch (err) {
    console.log('ERROR CREATING DATABASE', err);
  }

  try {
    if (db) {
      console.log('Adding hero collection...');
      await db.addCollections({
        heroes: {
          schema: schema,
        },
      });
      console.log('Collection added!');
    }
  } catch (err) {
    console.log('ERROR CREATING COLLECTION', err);
  }

  try {
    if (!db) return;
    console.log('Start sync...');
    const replicationState = replicateCouchDB({
      collection: db.heroes,
      url: `${syncURL}/${HeroesCollectionName}/`,
      fetch: fetch,
      pull: {},
      push: {},
    });

    // console.dir(replicationState);

    // replicationState.active$.subscribe((v: any) => {
    //   console.log('Replication active$:', v);
    // });
    // replicationState.canceled$.subscribe((v: any) => {
    //   console.log('Replication canceled$:', v);
    // });
    // replicationState.error$.subscribe(async (error: any) => {
    //   console.error('Replication error$:', error);
    // });
  } catch (err) {
    console.log('Error initialize sync', err);
  }

  return db;
};

export default initialize;
