import Utils from '../../js/modules/Utils.js';

export default function ( obj, options ) {
	if ( Utils.objectIsEmpty( obj ) === false ) {
		return options.fn( this );
	} else {
		return options.inverse( this );
	}
};