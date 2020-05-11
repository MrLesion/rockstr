import Achievements from '../../js/modules/Achievements.js';

export default function ( options ) {
	let hasAchievements = Achievements.get(null, true);
	if( hasAchievements.length > 0 ) {
		return options.fn( this );
	} else {
		return options.inverse( this );
	}
}