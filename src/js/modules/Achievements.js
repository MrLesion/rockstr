import Store from './Store.js';
import Utils from './Utils.js';
import Models from '../Models.js';
import Feed from './Feed.js';

const Achievements = {
	construct: () => {
		let playerAchievements = Store.get( 'achievements' );
		if ( Utils.isNullOrUndefined( playerAchievements ) === true ) {
			let achievementsModel = Models.achievements();
			Store.set( 'achievements', achievementsModel );
		}

	},
	get: ( prop, achieved ) => {
		let playerAchievements = Store.get( 'achievements' ) || {};
		if ( Utils.isNullOrUndefined( prop ) === true ) {
			if ( Utils.isNullOrUndefined( achieved ) === false ) {
				return Object.values( playerAchievements ).filter( a => a.achieved === achieved );
			} else {
				return Object.values( playerAchievements );
			}

		} else {
			if ( Utils.isNullOrUndefined( playerAchievements[ prop ] ) === false ) {
				if ( Utils.isNullOrUndefined( achieved ) === false ) {
					return playerAchievements[ prop ].achieved === achieved;
				} else {
					return playerAchievements[ prop ];
				}
			}
		}
		return false;
	},
	set: ( prop ) => {
		let playerAchievements = Store.get( 'achievements' );
		if ( playerAchievements[ prop ].achieved === false ) {
			playerAchievements[ prop ].achieved = true;
			Store.set( 'achievements', playerAchievements );
			Feed.add( 'achievements_' + prop );
		}

	}
}

export default Achievements;