import Models from '../Models.js';
import Store from './Store.js';
import Utils from './Utils.js';

const Settings = {
    construct: () => {
        Settings.model = Models.construct( 'settings' );
        Settings.bindings();
    },
    get: ( prop ) => {
        let queryObj = Utils.getter( Settings.model, prop );
        return queryObj;
    },
    set: ( prop, value ) => {
        Settings.model = Utils.setter( Settings.model, prop, value );
        Store.set( 'settings', Settings.model );
    },
    bindings: () => {

    }
}

export default Settings;
