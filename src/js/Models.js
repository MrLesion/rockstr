import Constants from './Constants.js';
import Store from './modules/Store.js';
import Utils from './modules/Utils.js';

const Models = {
	construct: ( key, userModel ) => {
		let stored = Store.get( key );
		let model = Utils.isNullOrUndefined( userModel ) ? Models[ key ] : userModel;
		if ( Utils.isNullOrUndefined( stored ) === true ) {
			stored = model;
		}
		let finalModel = Object.assign( model, stored );

		Store.set( key, finalModel );
		return finalModel;
	},
	settings: () => {
		return {
			keys: {
				'C': {
					name: 'z',
					code: 90
				},
				'C#': {
					name: 'x',
					code: 88
				},
				'D': {
					name: 'c',
					code: 67
				},
				'D#': {
					name: 'v',
					code: 86
				},
				'E': {
					name: 'a',
					code: 65
				},
				'F': {
					name: 's',
					code: 83
				},
				'F#': {
					name: 'd',
					code: 68
				},
				'G': {
					name: 'f',
					code: 70
				},
				'G#': {
					name: 'q',
					code: 81
				},
				'A': {
					name: 'w',
					code: 87
				},
				'A#': {
					name: 'e',
					code: 69
				},
				'B': {
					name: 'r',
					code: 82
				}
			},
			level: {
				easy: {
					selected: true,
					value: 0
				},
				hard: {
					selected: false,
					value: 1
				}
			}
		}
	},
	protagonist: () => {
		return {
			activity: 'activity_idle',
			creativity: 50,
			fame: Constants.INITIAL_VALUE_FAME,
			genre: '',
			happiness: Constants.INITIAL_VALUE_HAPPINESS,
			health: Constants.INITIAL_VALUE_HEALTH,
			isPlayer: true,
			mentality: Constants.INITIAL_VALUE_MENTALITY,
			money: Constants.INITIAL_VALUE_MONEY,
			name: ''
		}
	},
	achievements: () => {
		return {
			firstSong: {
				achieved: false,
				label: 'First recorded song'
			},
			firstChartEntry: {
				achieved: false,
				label: 'First time on the charts'
			},
			firstTopChartEntry: {
				achieved: false,
				label: 'First time as number 1 on the charts'
			},
			firstTimeDoingDrugs: {
				achieved: false,
				label: 'First time doing drugs'
			},
			firstBattleWon: {
				achieved: false,
				label: 'First time winning Battle og the Bands'
			},
			firstTour: {
				achieved: false,
				label: 'First tour'
			}
		}
	},
	time: () => {
		return {
			date: '',
			daysAlive: 0
		}
	},
	song: () => {
		return {
			name: '',
			genre: '',
			song: '',
			quality: 0,
			myEntry: false,
			new: true,
			sales: 0,
			weeks: 1,
			weeksAsOne: 0,
			released: '',
			chartEvent: '',
			icons: [],
			position: 0,
			prevQuality: 0,
			prevPostion: 0
		}
	},
	battle: () => {
		return {
			attacks: [ Constants.BATTLE_ATTACK_0, Constants.BATTLE_ATTACK_1, Constants.BATTLE_ATTACK_2 ],
			feed: []
		}
	},
	fight: () => {
		return {
			attacker: '',
			power: '',
			defender: '',
			defense: '',
			type: '',
			isAttack: true,
			hit: false,
			winner: '',
			prize: 0,
			fame: 0

		}
	},
	studio: () => {
		return {
			days: 0,
			song: '',
			temp: '',
			cost: 0,
			quality: 0
		}
	},
	tour: () => {
		return {
			time: 0,
			name: '',
			cost: 0,
			venue: '',
			scale: ''
		}
	},
	event: () => {
		return {
			title: '',
			start: '',
			end: '',
			extendedProps: {}
		}
	},
	gig: () => {
		return {
			isStarted: false,
			start: 0,
			timer: 0,
			result: 0,
			interval: null,
			audience: null,
			timeout: null,
			skillTimer: null,
			rounds: 0,
			points: 0,
		}
	}
};

export default Models;