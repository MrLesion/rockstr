import { TPL_TOP_BAR, TPL_END_MODAL } from '../Templates.js';

import * as Data from './Data.js';

import Utils from './Utils.js';
import Settings from '../Settings.js';
import Store from './Store.js';
import Time from './Time.js';
import Feed from './Feed.js';
import Events from './Events.js';
import Schedule from './Schedule.js';

/* Vendor */
import * as moment from 'moment';

const Protagonist = {
    model: {},
    construct: ( stdName = 'PlayerOne', stdGenre = 'Pop' ) => {
        let savedGamePlayer = Store.get( 'protagonist' );

        let name = Utils.isNullOrUndefined( savedGamePlayer ) ? stdName : savedGamePlayer.name;
        let genre = Utils.isNullOrUndefined( savedGamePlayer ) ? stdGenre : savedGamePlayer.genre;
        let isPlayer = Utils.isNullOrUndefined( savedGamePlayer ) ? true : savedGamePlayer.isPlayer;
        let fame = Utils.isNullOrUndefined( savedGamePlayer ) ? Settings.INITIAL_VALUE_FAME : savedGamePlayer.fame;
        let money = Utils.isNullOrUndefined( savedGamePlayer ) ? Settings.INITIAL_VALUE_MONEY : savedGamePlayer.money;
        let health = Utils.isNullOrUndefined( savedGamePlayer ) ? Settings.INITIAL_VALUE_HEALTH : savedGamePlayer.health;
        let mentality = Utils.isNullOrUndefined( savedGamePlayer ) ? Settings.INITIAL_VALUE_MENTALITY : savedGamePlayer.mentality;
        let creativity = Utils.isNullOrUndefined( savedGamePlayer ) ? Settings.INITIAL_VALUE_CREATIVITY : savedGamePlayer.creativity;
        let happiness = Utils.isNullOrUndefined( savedGamePlayer ) ? Settings.INITIAL_VALUE_HAPPINESS : savedGamePlayer.happiness;
        let activity = Utils.isNullOrUndefined( savedGamePlayer ) ? 'activity_idle' : savedGamePlayer.activity;

        Protagonist.model.name = name;
        Protagonist.model.genre = genre;
        Protagonist.model.isPlayer = isPlayer;
        Protagonist.model.fame = fame;
        Protagonist.model.money = money;
        Protagonist.model.health = health;
        Protagonist.model.mentality = mentality;
        Protagonist.model.creativity = creativity;
        Protagonist.model.happiness = happiness;
        Protagonist.model.activity = activity;
        Store.set( 'protagonist', Protagonist.model );
        Protagonist.bindings();
        Protagonist.update();
    },
    get: ( prop ) => {
        let stored = Store.get( 'protagonist' );
        if ( Utils.isNullOrUndefined( stored ) === true ) {
            return Protagonist.model[ prop ];
        } else {
            return stored[ prop ];
        }
    },
    set: ( prop, value, callback = Protagonist.status ) => {
        Protagonist.model[ prop ] = Utils.validateProtagonistValue( prop, value );
        Store.set( 'protagonist', Protagonist.model );
        Protagonist.update( callback );
    },
    updateValue: ( prop, addValue ) => {
        let newValue = Protagonist.get( prop ) + addValue;
        Protagonist.set( prop, newValue );
    },
    bindings: () => {
        Utils.delegate( 'click', '.protagonist-action-laze', () => {
            let days = Utils.randInt( 4 );
            Time.run( days, 'laze' );
        } );

        Utils.delegate( 'click', '.protagonist-action-busk', () => {
            let updateObject = Data.events.busk[ Utils.randIndex( Data.events.busk.length ) ];
            let days = Utils.randInt( 4 );
            Feed.event( updateObject );
            Time.run( days, 'busk', updateObject );
        } );

        Utils.delegate( 'click', '.protagonist-action-record', () => {
            Events.studio.run();
        } );

        Utils.delegate( 'click', '.protagonist-action-gig', () => {
            Events.battle.run();
        } );

        Utils.delegate( 'click', '.protagonist-action-continue', ( event ) => {
            let type = event.target.dataset.type;
            Time.run( 0, type );
        } );
        Utils.delegate( 'click', '.restart-game', () => {
            Store.reset();
        } );
        Utils.eventEmitter.on( 'protagonist.timeupdate', () => {
            Protagonist.handleAddiction();
        } );
    },
    handleAddiction: () => {
        let addictions = Store.get( 'addictions' ) || {};
        if ( Utils.objectIsEmpty( addictions ) === false ) {
            Object.keys( addictions ).forEach( ( drugKey ) => {
                Utils.doDrugEffect( drugKey, addictions[ drugKey ] );
            } );
        }
    },
    doDrugs: ( eventObj ) => {
        let addictions = Store.get( 'addictions' ) || {};
        let drug = eventObj.drug;

        let addictionsMods = Data.core.addictions[ drug ];

        if ( Utils.isNullOrUndefined( addictions[ drug ] ) === false ) {
            addictions[ drug ] = {
                trip: addictions[ drug ].trip + addictionsMods.modifier,
                addictionLevel: addictions[ drug ].addiction + 1
            }
        } else {
            addictions[ drug ] = {
                trip: addictionsMods.modifier,
                addictionLevel: 1
            }
        }

        //let addictionsLevels = Data.core.addictLevels;

        if ( addictions[ drug ].addictionLevel > Settings.ADDICTION_LEVEL_LOW[ 0 ] && addictions[ drug ].addictionLevel < Settings.ADDICTION_LEVEL_LOW[ 1 ] ) {
            addictions[ drug ].addictionText = Data.core.addictLevels.low;
        } else if ( addictions[ drug ].addictionLevel >= Settings.ADDICTION_LEVEL_MEDIUM[ 0 ] && addictions[ drug ].addictionLevel < Settings.ADDICTION_LEVEL_MEDIUM[ 1 ] ) {
            addictions[ drug ].addictionText = Data.core.addictLevels.medium;

        } else if ( addictions[ drug ].addictionLevel >= Settings.ADDICTION_LEVEL_HIGH[ 0 ] ) {
            addictions[ drug ].addictionText = Data.core.addictLevels.high;
        }

        const wrapper = document.querySelector( '.wrapper' );
        wrapper.classList.add( drug + '-trip' );
        Store.set( 'addictions', addictions );

        Object.keys( addictionsMods.update ).forEach( ( key ) => {
            let oldValue = Protagonist.get( key );
            Protagonist.set( key, oldValue + addictionsMods.update[ key ].value );
        } );
        Feed.add( 'doDrugs_' + drug );
        Protagonist.update();
    },
    doPromotion: ( eventObj ) => {
        let time = Store.get( 'time' ) !== null ? Store.get( 'time' ).date : Settings.START_DATE;
        let randEventDays = Utils.randInt( 10 );
        let eventDate = moment( time ).add( randEventDays, 'days' );
        let jobs = Store.get( 'jobs' );
        let manager = jobs.filter( ( npc ) => {
            return npc.job === 'manager';
        } )[ 0 ];
        Schedule.register( eventObj, eventDate );

        Feed.add( 'doPromotion_' + eventObj.promotion, { manager: manager.name, days: randEventDays } );

        //Time.run(0, 'promotion', promotion);
    },
    status: () => {
        let protagonistStats = Protagonist.model;
        //console.group('Protagonist status:');
        Object.keys( protagonistStats ).forEach( ( key ) => {
            //console.log(key, protagonistStats[key]);
            if ( typeof protagonistStats[ key ] === 'number' ) {
                if ( protagonistStats[ key ] > 10 && protagonistStats[ key ] <= 30 ) {
                    console.warn( key + ' is quite low' );
                } else if ( protagonistStats[ key ] > 0 && protagonistStats[ key ] <= 10 ) {
                    console.error( key + ' is VERY low' );
                } else if ( protagonistStats[ key ] <= 0 ) {
                    if ( key !== 'fame' ) {
                        Protagonist.endGame( key );
                    }

                }
            }
        } );
        //console.groupEnd();
    },
    update: ( fnCallback ) => {
        const container = document.querySelector( '.hbs-container-topbar' );
        container.innerHTML = TPL_TOP_BAR( { protagonist: Protagonist.model, time: Store.get( 'time' ), npc: Store.get( 'jobs' ), addictions: Store.get( 'addictions' ), songs: Store.get( 'songs' ) } );
        if ( typeof fnCallback === 'function' ) {
            fnCallback();
        }
    },
    endGame: ( key ) => {
        const container = document.querySelector( '.hbs-container-last' );
        let timeLived = Store.get( 'time' ) !== null ? Store.get( 'time' ).daysAlive : 0;
        let deathYear = Store.get( 'time' ) !== null ? Store.get( 'time' ).date : 0;
        let endObj = {
            protagonist: Protagonist.model,
            msg: '',
            year: moment( deathYear ).format( 'YYYY' ),
            time: timeLived
        };
        if ( key === 'money' ) {
            endObj.msg = 'You ran out of money';
        } else if ( key === 'mentality' ) {
            endObj.msg = 'You went crazy';
        } else if ( key === 'happiness' ) {
            endObj.msg = 'Your sadness overwhelmed you and you slid your own wrists';
        } else if ( key === 'health' ) {
            endObj.msg = 'Your body couldn\'t take anymore - it simply gave up and collapsed';
        } else if ( key === 'health' ) {
            endObj.msg = 'Your interest in the creative arts have withered. You give up music and become a banker';
        }
        container.innerHTML = TPL_END_MODAL( endObj );
    },
    restart: () => {

    }
};

export default Protagonist;