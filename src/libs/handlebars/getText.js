import Utils from '../../js/modules/Utils.js';
import Dictionary from '../../js/Dictionary.js';

import * as moment from 'moment';

export default function ( textKey, replaceObj ) {
	let text = Dictionary.get( textKey );
	if ( Utils.isNullOrUndefined( replaceObj ) === false ) {
		Object.keys( replaceObj ).forEach( ( key ) => {
			text = text.replace( '[' + key + ']', replaceObj[ key ] );
		} );
	}
	return text;
};