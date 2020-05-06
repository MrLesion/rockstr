import Utils from '../../js/modules/Utils.js';
import Dictionary from '../../js/Dictionary.js';

export default function ( textKey, replaceObj ) {
	let strText = Dictionary.get( textKey );
	if ( Utils.isNullOrUndefined( replaceObj ) === false ) {
		Utils.each( replaceObj, ( prop, value ) => {
			strText = strText.replace( '<-' + prop + '->', value );
		} );
	}
	strText = Utils.replacePlaceholder( strText );
	return strText;
}