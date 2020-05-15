import Settings from './Settings.js';

const Models = {
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
			attacks: [ Settings.BATTLE_ATTACK_0, Settings.BATTLE_ATTACK_1, Settings.BATTLE_ATTACK_2 ],
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
			skillTimer:null,
			rounds: 0,
			points: 0,
		}
	}
};

export default Models;