import { TPL_TOP_BAR, TPL_END_MODAL } from '../Templates.js';

import Data from '../Data.js';

import Models from '../Models.js';
import Utils from './Utils.js';
import Constants from '../Constants.js';
import Store from './Store.js';
import Time from './Time.js';
import Feed from './Feed.js';
import Studio from './Studio.js';
import Schedule from './Schedule.js';
import Tour from './Tour.js';
import Achievements from './Achievements.js';

/* Vendor */
import * as moment from 'moment';

const Protagonist = {
    construct: ( stdName = 'PlayerOne', stdGenre = 'Pop' ) => {
        let model = Models.protagonist();
        model.name = stdName;
        model.genre = stdGenre;
        Protagonist.model = Models.construct( 'protagonist', model );
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
    set: ( prop, value, update = false, callback = Protagonist.status ) => {
        if ( update === true ) {
            value = Protagonist.updateValue( prop, value );
        }
        Protagonist.model[ prop ] = Utils.validateProtagonistValue( prop, value );
        Store.set( 'protagonist', Protagonist.model );
        Protagonist.update( callback );
    },
    updateValue: ( prop, addValue ) => {
        let newValue = Protagonist.get( prop ) + addValue;
        return newValue;
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
            Studio.run();
        } );

        Utils.delegate( 'click', '.protagonist-action-tour', () => {
            Tour.run();
        } );

        Utils.delegate( 'click', '.protagonist-action-holiday', () => {
            let ach = Achievements.get( 'firstSong', true );
            console.log( ach );
        } );

        Utils.delegate( 'click', '.protagonist-action-continue', ( event ) => {
            let type = event.target.dataset.type;
            Time.run( 0, type );
        } );
        Utils.eventEmitter.on( 'protagonist.timeupdate', () => {
            Protagonist.handleAddiction();
        } );
    },
    handleAddiction: () => {
        let addictions = Store.get( 'addictions' ) || {};
        if ( Utils.objectIsEmpty( addictions ) === false ) {
            Utils.each( addictions, ( prop, value ) => {
                Utils.doDrugEffect( prop, value );
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

        if ( addictions[ drug ].addictionLevel > Constants.ADDICTION_LEVEL_LOW[ 0 ] && addictions[ drug ].addictionLevel < Constants.ADDICTION_LEVEL_LOW[ 1 ] ) {
            addictions[ drug ].addictionText = Data.core.addictLevels.low;
        } else if ( addictions[ drug ].addictionLevel >= Constants.ADDICTION_LEVEL_MEDIUM[ 0 ] && addictions[ drug ].addictionLevel < Constants.ADDICTION_LEVEL_MEDIUM[ 1 ] ) {
            addictions[ drug ].addictionText = Data.core.addictLevels.medium;

        } else if ( addictions[ drug ].addictionLevel >= Constants.ADDICTION_LEVEL_HIGH[ 0 ] ) {
            addictions[ drug ].addictionText = Data.core.addictLevels.high;
        }

        const wrapper = document.querySelector( '.wrapper' );
        wrapper.classList.add( drug + '-trip' );
        Achievements.set( 'firstTimeDoingDrugs' );
        Store.set( 'addictions', addictions );

        Utils.each( addictionsMods.update, ( prop, value ) => {
            Protagonist.set( prop, value.value, true );
        } );

        Feed.add( 'doDrugs_' + drug );
        Protagonist.update();
    },
    doPromotion: ( eventObj ) => {
        let time = Time.today();
        let randEventDays = Utils.randInt( 10 );
        let eventDate = moment( time ).add( randEventDays, 'days' );
        let manager = Utils.getNpc( 'manager' );

        let scheduleEventObj = Object.assign( {}, Models.event );
        scheduleEventObj.title = eventObj.schedule.title;
        scheduleEventObj.start = eventDate;
        scheduleEventObj.extendedProps = {
            type: eventObj.promotion
        };

        Schedule.register( scheduleEventObj );
        Feed.add( 'doPromotion_' + eventObj.promotion, { manager: manager, days: randEventDays } );
    },
    status: () => {
        let protagonistStats = Protagonist.model;
        //console.group('Protagonist status:');

        Utils.each( protagonistStats, ( prop, value ) => {
            if ( typeof value === 'number' ) {
                if ( value > 10 && value <= 30 ) {
                    console.warn( prop + ' is quite low' );
                } else if ( value > 0 && value <= 10 ) {
                    console.error( prop + ' is VERY low' );
                } else if ( value <= 0 ) {
                    if ( prop !== 'fame' ) {
                        Protagonist.endGame( prop );
                    }

                }
            }
        } );
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
