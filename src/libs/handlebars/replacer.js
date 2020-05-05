import Utils from '../../js/modules/Utils.js';

export default function ( strText ) {
	strText = Utils.replacePlaceholder( strText );
	return strText;
}