import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Bands from './Bands.js';
import Store from './Store.js';
import Dictionary from '../Dictionary.js';
import Charts from './Charts.js';
import Events from './Events.js';
import News from './News.js';
import Protagonist from './Protagonist.js';
import Schedule from './Schedule.js';
import Modal from './Modal.js';

/* Vendor */
import * as moment from 'moment';

/* Templates */
import * as bottomTmp from '../../templates/bottombar.hbs';


const Time = {
    model: {},
    ticks: 0,
    ticker: null,
    construct: () => {
        Time.model.date = Time.get().date;
        Time.model.daysAlive = Time.get().daysAlive;
        Store.set( 'time', Time.model );
        Time.update();
    },
    set: ( add, callback ) => {
        Time.model.date = moment( Store.get( 'time' ).date ).add( add, 'days' );
        Time.model.daysAlive += add;
        Store.set( 'time', Time.model );
        Time.update();
        if ( typeof callback === 'function' ) {
            return callback( value );
        }
    },
    get: () => {
        let stored = Store.get( 'time' );
        if ( Utils.isNullOrUndefined( stored ) === true ) {
            return {
                date: Settings.STARTDATE,
                daysAlive: 1
            };
        } else {
            return stored;
        }
    },
    run: ( days = 0, type = 'laze', timeObj = null ) => {

        let activity = Dictionary.get( 'activity_' + type );

        document.querySelector('.hbs-container-bottombar').innerHTML = bottomTmp({activity: type});

        document.querySelector( '.wrapper' ).classList.add( 'time-ticking' );

        if ( Utils.isNullOrUndefined( timeObj ) === false ) {
            Time.ticks = timeObj.duration;
        } else {
            Time.ticks += days;
        }

        Protagonist.set( 'activity', activity );

        Time.ticker = setInterval( () => {
            console.log( 'Time.run', Time.ticks );
            const eventTick = Utils.randInt( 20 );
            Time.set( 1 );
            let checkDateForEvent = Schedule.updateDate();
            Time.handleModifiers();
            if ( Utils.objectIsEmpty( checkDateForEvent ) === false ) {
                Time.end( type );
                Events.schedule.run( checkDateForEvent );
            } else if ( Utils.isNullOrUndefined( timeObj ) === true && eventTick < 5 ) {
                Time.pause( eventTick, type );
                Events.run();

            } else if ( Time.ticks < 1 ) {
                Time.end( type );
                if ( Utils.isNullOrUndefined( timeObj ) === false && timeObj.update ) {
                    Object.keys( timeObj.update ).forEach( ( key ) => {
                        let oldValue = Protagonist.get( key );
                        Protagonist.set( key, oldValue + timeObj.update[ key ].value );
                    } );
                    if ( timeObj.callback && typeof timObj.callback === 'function' ) {
                        timeObj.callback( type );
                    }
                }
            }
            let band = Bands.getBand();
            Time.ticks--;
        }, Settings.TICK );
    },

    end: (type = 'idle') => {
        console.log( 'Time.end_' + type );
        document.querySelector('.hbs-container-bottombar').innerHTML = bottomTmp({activity: type});
        Utils.eventEmitter.emit( 'timeend_' + type );
        const wrapper = document.querySelector( '.wrapper' );
        wrapper.classList.remove( 'time-ticking' );
        
        Protagonist.set( 'activity', 'Idle' );
        Time.ticks = 0;
        clearInterval( Time.ticker );
    },
    pause: ( eventTick, type = 'idle' ) => {
        console.log( 'Time.pause', eventTick );
        const wrapper = document.querySelector( '.wrapper' );
        wrapper.classList.remove( 'time-ticking' );
        document.querySelector('.hbs-container-bottombar').innerHTML = bottomTmp({activity: type});
        Protagonist.set( 'activity', 'Idle' );
        clearInterval( Time.ticker );
    },
    handleModifiers: () => {
        const wrapper = document.querySelector( '.wrapper' );
        let addictions = Store.get( 'addictions' ) || {};

        Object.keys( addictions ).forEach( ( key ) => {
            if ( addictions[ key ].trip > 0 ) {
                wrapper.classList.add( key + '-trip' );
                addictions[ key ].trip = addictions[ key ].trip - 1;
            } else {
                wrapper.classList.remove( key + '-trip' );
            }
        } );

        Store.set( 'addictions', addictions );
    },
    update: () => {
        let dateElement = document.querySelector( '[data-prop="date"]' );
        if ( Utils.isNullOrUndefined( dateElement ) === false ) {
            dateElement.innerHTML = moment( Time.model.date ).format( Settings.DATEFORMAT );
        }
        if ( Time.model.daysAlive > 1 && Time.model.daysAlive % Settings.RENTDUE === 0 ) {
            Events.emit( 'rentDue' );
        }
        if ( Time.model.daysAlive > 1 && Time.model.daysAlive % 7 === 0 ) {
            Events.emit( 'chartsUpdate' );
        } else {
            News.get();
        }
    }
}

export default Time;