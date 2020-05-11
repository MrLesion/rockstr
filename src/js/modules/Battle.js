import { TPL_EVENT_BATTLE_MODAL } from '../Templates.js';

import Settings from '../Settings.js';
import Models from '../Models.js';
import Utils from './Utils.js';
import Protagonist from './Protagonist.js';
import Bands from './Bands.js';
import Achievements from './Achievements.js';

const Battle = {
	model: {},
	create: () => {
		Object.assign( Battle.model, Models.battle() );

		let battleObject = {
			turn: Utils.randInt( 6 ) > 3 ? 'player' : 'opponent'
		};
		let band = Bands.getBand();
		battleObject.player = {
			name: Protagonist.get( 'name' ),
			genre: Protagonist.get( 'genre' ),
			health: Protagonist.get( 'health' ),
			creativity: Protagonist.get( 'creativity' ),
			mentality: Protagonist.get( 'mentality' ),
			fame: Protagonist.get( 'fame' ) / Settings.FAME_PROGRESS_FACTOR * 100
		};
		battleObject.opponent = {
			name: band.name,
			genre: band.genre,
			health: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) ),
			creativity: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) ),
			mentality: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) ),
			fame: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) )
		};
		Object.assign( Battle.model, battleObject );
	},
	run: () => {
		Battle.create();
		Battle.build();
		Utils.eventEmitter.emit( 'modal.show', () => {
			Utils.eventEmitter.emit( 'event.battle.ready' );
		} );
	},
	build: () => {
		let modalContainer = document.querySelector( '.modal-backdrop' );
		let data = Object.assign( {}, Battle.model );
		modalContainer.innerHTML = TPL_EVENT_BATTLE_MODAL( data );
	},
	bindings: () => {
		Utils.eventEmitter.on( 'event.battle.ready', () => {
			if ( Battle.model.turn === 'opponent' ) {
				Battle.attack( false );
			}
		} );
		Utils.eventEmitter.on( 'event.battle.turn', ( currentTurn ) => {
			Battle.changeTurn( currentTurn );
		} );
		Utils.eventEmitter.on( 'event.battle.end', ( winner ) => {
			Battle.end( winner );
		} );
		Utils.delegate( 'click', '.event-battle-action', ( event ) => {
			let action = event.target.dataset.action;
			Battle.attack( true, action );
		} );
	},
	calculateDamage: ( isUser, type ) => {
		let damage = 0;
		if ( type === Settings.BATTLE_ATTACK_0 ) {
			damage = isUser ? Protagonist.get( 'creativity' ) : Utils.randInt( Settings.BATTLE_MAX_POWER );
		} else if ( type === Settings.BATTLE_ATTACK_1 ) {
			damage = isUser ? Protagonist.get( 'mentality' ) : Utils.randInt( Settings.BATTLE_MAX_POWER );
		} else if ( type === Settings.BATTLE_ATTACK_2 ) {
			damage = isUser ? ( Protagonist.get( 'creativity' ) + Protagonist.get( 'health' ) ) : Utils.randInt( Settings.BATTLE_MAX_POWER * 2 );
		}
		return damage;
	},
	attack: ( isUser, type = '' ) => {
		if ( type === '' ) {
			type = Battle.model.attacks[ Utils.randIndex( Battle.model.attacks.length ) ];
		}
		let damage = Battle.calculateDamage( isUser, type );
		if ( isUser === false ) {
			setTimeout( () => {
				Battle.fight( isUser, damage, type );
			}, 1000 );
		} else {
			Battle.fight( isUser, damage, type );
		}

	},
	fight: ( isUser, power, type ) => {
		let defense = Utils.randInt( Settings.BATTLE_MAX_POWER );
		let outcome = Object.assign( {}, Models.fight() );
		let attacker = isUser ? Battle.model.player : Battle.model.opponent;
		let defender = isUser ? Battle.model.opponent : Battle.model.player;

		outcome.attacker = attacker;
		outcome.type = type;
		outcome.power = power;
		outcome.defender = defender;
		outcome.defense = defense;

		if ( power > defense ) {
			outcome.hit = true;
			if ( isUser ) {
				Battle.model.opponent.health -= Math.floor( power - defense );
			} else {
				Battle.model.player.health -= Math.floor( power - defense );
			}
		} else {
			outcome.hit = false;
		}
		Battle.model.feed.unshift( outcome );
		if ( Battle.model.opponent.health <= 0 ) {
			Utils.eventEmitter.emit( 'event.battle.end', 'player' );
		} else if ( Battle.model.player.health <= 0 ) {
			Utils.eventEmitter.emit( 'event.battle.end', 'opponent' );
		} else {
			Utils.eventEmitter.emit( 'event.battle.turn', Battle.model.turn );
		}

	},
	changeTurn: ( currentTurn ) => {
		Battle.model.turn = currentTurn === 'player' ? 'opponent' : 'player';
		Battle.build();
		Utils.eventEmitter.emit( 'event.battle.ready' );
	},
	end: ( winner ) => {
		let prize = {
			money: Utils.randInt( Settings.BATTLE_PRIZE_MONEY ),
			fame: Utils.randInt( Settings.BATTLE_PRIZE_FAME )
		};
		let outcome = Object.assign( {}, Models.fight() );

		outcome.winner = Battle.model[ winner ].name;
		outcome.prize = prize.money;
		outcome.isAttack = false;

		Battle.model.feed.unshift( outcome );
		Battle.build();
		if ( winner === 'player' ) {
			Protagonist.set( 'money', prize.money, true );
			Protagonist.set( 'fame', prize.fame, true );
			Achievements.set( 'firstBattleWon' );
		}
		Battle.reset();
		setTimeout( () => {
			Utils.eventEmitter.emit( 'modal.hide' );
		}, Settings.BATTLE_END_TIMEOUT );
	},
	reset: () => {
		Battle.model.feed = [];
	}
};

export default Battle;