import Settings from './Settings.js';

const Models = {
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
	}
};

export default Models;