import Settings from '../Settings.js';
import Models from '../Models.js';
import Utils from './Utils.js';
import Bands from './Bands.js';
import Store from './Store.js';
import Events from './Events.js';
import Protagonist from './Protagonist.js';
import Schedule from './Schedule.js';
import Feed from './Feed.js';

/* Vendor */
import * as moment from 'moment';


const Time = {
    model: {},
    ticks: 0,
    ticker: null,
    construct: () => {
        Object.assign( Time.model, Models.time() );
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
            return callback();
        }
    },
    get: () => {
        let stored = Store.get( 'time' );
        if ( Utils.isNullOrUndefined( stored ) === true ) {
            return {
                date: Settings.START_DATE,
                daysAlive: 1
            };
        } else {
            return stored;
        }
    },
    today: ( format = false ) => {
        let returnTime = null;
        if ( Utils.isNullOrUndefined( Store.get( 'time' ) ) === false ) {
            returnTime = Store.get( 'time' ).date;
        } else {
            returnTime = Settings.START_DATE;
        }
        if ( format === true ) {
            returnTime = moment( returnTime ).format( Settings.DATE_FORMAT );
        }
        return returnTime;
    },
    run: ( days = 0, type = 'laze', timeObj = null ) => {
        Utils.eventEmitter.emit( 'time.start', type );
        document.querySelector( '.wrapper' ).classList.add( 'time-ticking' );

        if ( Utils.isNullOrUndefined( timeObj ) === false ) {
            Time.ticks = timeObj.duration;
        } else {
            Time.ticks += days;
        }
        Protagonist.set( 'activity', 'activity_' + type );
        Time.ticker = setInterval( Time.handelDay( type, timeObj ), Settings.TIME_TICK );
    },
    handelDay: ( type, timeObj ) => {
        return ( () => {
            console.log( 'Time.run', Time.ticks, type );
            const eventTick = Utils.randInt( 20 );
            Time.set( 1 );
            let checkDateForEvent = Schedule.updateDate();
            Time.handleModifiers();
            Bands.getBand();

            if ( type === 'studio' ) {
                Feed.add( 'studioDay' );
            }

            if ( Utils.objectIsEmpty( checkDateForEvent ) === false ) {
                Time.end( type );
                Schedule.run( checkDateForEvent );
            } else if ( Utils.isNullOrUndefined( timeObj ) === true && eventTick < 5 ) {
                Time.pause( eventTick, type );
                Events.run();
            } else if ( Time.ticks < 1 ) {
                Time.end( type );
                if ( Utils.isNullOrUndefined( timeObj ) === false && timeObj.update ) {
                    Utils.each( timeObj.update, ( prop, value ) => {
                        Protagonist.set( prop, value.value, true );
                    } );
                    if ( timeObj.callback && typeof timeObj.callback === 'function' ) {
                        timeObj.callback( type );
                    }
                }
            }
            Time.ticks--;
        } );
    },
    end: ( type = 'idle' ) => {
        Utils.eventEmitter.emit( 'time.end', 'idle', type );
        const wrapper = document.querySelector( '.wrapper' );
        wrapper.classList.remove( 'time-ticking' );
        Protagonist.set( 'activity', 'activity_idle' );
        Time.ticks = 0;
        clearInterval( Time.ticker );
    },
    pause: ( eventTick, type = 'idle' ) => {
        Utils.eventEmitter.emit( 'time.pause', type, eventTick );
        const wrapper = document.querySelector( '.wrapper' );
        wrapper.classList.remove( 'time-ticking' );
        Protagonist.set( 'activity', 'activity_' + type );
        clearInterval( Time.ticker );
    },
    handleModifiers: () => {
        const wrapper = document.querySelector( '.wrapper' );
        let addictions = Store.get( 'addictions' ) || {};

        Utils.each( addictions, ( prop, value ) => {
            if ( value.trip > 0 ) {
                wrapper.classList.add( prop + '-trip' );
                value.trip = value.trip - 1;
            } else {
                wrapper.classList.remove( prop + '-trip' );
            }
        } );


        Store.set( 'addictions', addictions );
    },
    update: () => {
        let dateElement = document.querySelector( '[data-prop="date"]' );
        Utils.eventEmitter.emit( 'news.get' );
        Utils.eventEmitter.emit( 'protagonist.timeupdate' );
        if ( Utils.isNullOrUndefined( dateElement ) === false ) {
            dateElement.innerHTML = Time.today( true );
        }
        if ( Time.model.daysAlive > 1 && Time.model.daysAlive % Settings.RENT_DUE_INTERVAL === 0 ) {
            Utils.eventEmitter.emit( 'protagonist.rent' );
        }
        if ( Time.model.daysAlive > 1 && Time.model.daysAlive % Settings.CHARTS_UPDATE_INTERVAL === 0 ) {
            Utils.eventEmitter.emit( 'charts.update' );
        }

    }
}

export default Time;