import Dictionary from '../../js/Dictionary.js';

export default function ( textKey ) {
    let strText = Dictionary.get( textKey, true );
    return strText;
}
