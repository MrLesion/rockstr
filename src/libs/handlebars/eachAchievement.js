import Achievements from '../../js/modules/Achievements.js';

export default function ( options ) {
	let hasAchievements = Achievements.get( null, true );
	let accum = '';
	for ( let i = 0; i < hasAchievements.length; ++i ) {
		accum += options.fn( hasAchievements[i] );
	}
	return accum;
}