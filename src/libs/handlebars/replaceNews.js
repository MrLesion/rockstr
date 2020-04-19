import Utils from '../../js/modules/Utils.js';

export default function ( strText ) {
	if ( Utils.isNullOrUndefined( strText ) === false ) {
		strText = strText.replace( /New York Times/g, 'Daily Rockstr Gazette' );
		strText = strText.replace( /New York/g, 'Rockstr City' );
		strText = strText.replace( /N\.Y/g, 'R.C' );
	}

	return strText;
}