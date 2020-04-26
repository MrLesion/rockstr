export default function ( entry ) {
	let returnValue = '';
	if ( entry.weeks > 1 ) {
		if ( entry.position > entry.prevPostion ) {
			returnValue = 'down';
		} else if ( entry.position < entry.prevPostion ) {
			returnValue = 'up';
		}
	} else{
		returnValue = 'new';
	}
	return returnValue;

}