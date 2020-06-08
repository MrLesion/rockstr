import Constants from '../../js/Constants.js';

export default function ( current, goal, options ) {
	if ( ( current / Constants.FAME_PROGRESS_FACTOR ) >= goal ) {
		return options.fn( this );
	} else {
		return options.inverse( this );
	}
}