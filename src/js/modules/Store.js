import Utils from './Utils.js';

const Store = {
    data: {},
    hiddenInstances: [],
    construct: () => {
        Store.data = {
            protagonist: Store.load( 'protagonist' ),
            time: Store.load( 'time' ),
            charts: Store.load( 'charts' ),
            bands: Store.load( 'bands' ),
            jobs: Store.load( 'jobs' ),
            addictions: Store.load( 'addictions' ),
            schedule: Store.load( 'schedule' ),
            songs: Store.load( 'songs' )
        }
    },
    set: ( key, dataObj ) => {
        Store.data[ key ] = dataObj;
        Store.save( key, dataObj );
    },
    get: ( key ) => {
        if ( Utils.isNullOrUndefined( Store.data[ key ] ) === false ) {
            return Store.data[ key ];
        }
        return null;

    },
    load: ( key ) => {
        let dataObj = localStorage.getItem( 'rockstr.' + key );
        if ( Utils.isNullOrUndefined( dataObj ) === false ) {
            return JSON.parse( dataObj );
        }
        return null;
    },
    save: ( key, obj ) => {
        let saveString = typeof obj === 'string' ? obj : JSON.stringify( obj );
        localStorage.setItem( 'rockstr.' + key, saveString );
    }
}

export default Store;