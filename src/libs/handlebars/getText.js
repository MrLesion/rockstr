import Utils from '../../js/modules/Utils.js';
import Dictionary from '../../js/Dictionary.js';

import * as moment from 'moment';

export default function ( textKey, replaceObj ) {
	let strText = Dictionary.get( textKey );
	if ( Utils.isNullOrUndefined( replaceObj ) === false ) {
		Object.keys( replaceObj ).forEach( ( key ) => {
			strText = strText.replace( '<-' + key + '->', replaceObj[ key ] );
		} );
	}
	strText = Utils.replacePlaceholder( strText );
	return strText;
};