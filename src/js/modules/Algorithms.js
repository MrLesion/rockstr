import Settings from '../Settings.js';
import Utils from './Utils.js';
import Protagonist from './Protagonist.js';

const Algorithms = {
	userhealth: 0,
	npchealth: 0,
	test: () => {
		Algorithms.userhealth = Protagonist.get( 'health' );
		Algorithms.npchealth = Algorithms.getBandStat( Settings.BATTLE_MAX_POWER );
		setInterval( () => {
			let isUser = Utils.randInt( 5 ) > 2;
			let rand2 = Utils.randInt( 3 );
			let type = '';

			if ( rand2 === 1 ) {
				type = 'lyrics';
			} else if ( rand2 === 2 ) {
				type = 'skill';
			} else if ( rand2 === 3 ) {
				type = 'arrogance';
			}

			let attack = Algorithms.battle.attack( isUser, type );
			Algorithms.battle.run( isUser, attack );
		}, 2000 );
	},
	getBandStat: ( int ) => {
		return Math.floor( Utils.randInt( int ) );
	},
	battle: {
		attack: ( isUser, type ) => {
			let damage = 0;
			if ( type === 'lyrics' ) {
				damage = isUser ? Protagonist.get( 'creativity' ) : Algorithms.getBandStat( Settings.BATTLE_MAX_POWER );
			} else if ( type === 'skill' ) {
				damage = isUser ? Protagonist.get( 'mentality' ) : Algorithms.getBandStat( Settings.BATTLE_MAX_POWER );
			} else if ( type === 'arrogance' ) {
				damage = isUser ? ( Protagonist.get( 'fame' ) / Settings.FAME_PROGRESS_FACTOR ) : Algorithms.getBandStat( Settings.BATTLE_MAX_POWER );
			}
			return damage;
		},
		run: ( isUser, attack ) => {
			let defense = Algorithms.getBandStat( Settings.BATTLE_MAX_POWER );
			let outcome = '';
			if ( attack > defense ) {
				outcome = 'HIT with attack of ' + attack + ' against defense of ' + defense;
				if ( isUser ) {
					Algorithms.npchealth -= Math.floor( attack - defense );
				} else {
					Algorithms.userhealth -= Math.floor( attack - defense );
				}
			} else {
				outcome = 'MISS with attack of ' + attack + ' against defense of ' + defense;
			}
			console.log( ( isUser ? 'User attack: ' : 'NPC attack: ' ) + outcome );
			console.log( isUser ? 'NPC health: ' + Algorithms.npchealth : 'User health: ' + Algorithms.userhealth );
		}
	}
};

export default Algorithms;