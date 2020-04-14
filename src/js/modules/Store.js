import Utils from './Utils.js';

const Store = {
    data: {},
    hiddenInstances: [],
    construct: () => {
        let db;

        Store.data = {
            protagonist: Store.load('protagonist'),
            time: Store.load('time'),
            charts: Store.load('charts'),
            bands: Store.load('bands'),
            jobs: Store.load('jobs'),
            addictions: Store.load('addictions'),
            schedule: Store.load('schedule')
        }
    },

    database: {
        _db: {},
        init: () => {
            Store.database.open();
        },
        open: () => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

            vStore.database._db = indexedDB.open('rockstr_db', 1);

            Store.database._db.onupgradeneeded = function() {
                var db = {}
                db.result = openDB.result;
                db.store = db.result.createObjectStore('protagonist', { keyPath: "protagonist" });
                db.store = db.result.createObjectStore("time", { keyPath: "time" });
                db.store = db.result.createObjectStore("MyObjectStore", { keyPath: "id" });
                db.store = db.result.createObjectStore("MyObjectStore", { keyPath: "id" });
                if (fileindex) {
                    db.index = db.store.createIndex("NameIndex", fileindex);
                }
            };

            return openDB;
        },
        get: () => {
            var db = {};
            db.result = Store.database._db.result;

            db.tx = db.result.transaction("MyObjectStore", "readwrite");
            db.store = db.tx.objectStore("MyObjectStore");
            db.index = db.store.index("NameIndex");

            return db;
        }

    },
    set: (key, dataObj) => {
        Store.data[key] = dataObj;
        Store.save(key, dataObj);
    },
    get: (key) => {
        if(Utils.isNullOrUndefined(Store.data[key]) === false){
            return Store.data[key];
        }
        return null;
        
    },
    load: (key) => {
        let dataObj = localStorage.getItem('rockstr.' + key);
        if (Utils.isNullOrUndefined(dataObj) === false) {
            return JSON.parse(dataObj);
        }
        return null;
    },
    save: (key, obj) => {
        let saveString = typeof obj === 'string' ? obj : JSON.stringify(obj);
        localStorage.setItem('rockstr.' + key, saveString);
    }
}

export default Store;