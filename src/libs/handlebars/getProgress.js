import Constants from '../../js/Constants.js';

export default function ( progress, type ) {
	return progress / ( type === 'fame' ? Constants.FAME_PROGRESS_FACTOR : 1 );
}