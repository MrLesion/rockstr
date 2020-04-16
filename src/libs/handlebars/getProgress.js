import Settings from '../../js/Settings.js';

export default function ( progress, type ) {
	return progress / ( type === 'fame' ? Settings.FAME_PROGRESS_FACTOR : 1 );
};