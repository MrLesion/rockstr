import Models from '../Models.js';
import Store from './Store.js';
import Utils from './Utils.js';

const Settings = {
	construct: () => {
		let stored = Store.get( 'settings' );
		let model = Models.settings();
		if(Utils.isNullOrUndefined( stored ) === true){
			stored = model;
		}
		Settings.model = Object.assign(model, stored);
		Store.set( 'settings', Settings.model );
		Settings.bindings();
	},
	get: ( prop ) => {
        return Settings.model[ prop ];
    },
    set: ( prop, value) => {
        Settings.model[ prop ] = value;
        Store.set( 'settings', Settings.model );
    },
    bindings: () => {

    }
}

export default Settings;