import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Feed from './Feed.js';
import Protagonist from './Protagonist.js';
import Charts from './Charts.js';
import Schedule from './Schedule.js';
import Battle from './Battle.js';
import Studio from './Studio.js';

const Events = {
    current: {},
    next: {},
    construct: () => {
        Events.bindings();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'protagonist.rent', () => {
            Events.rentDue();
        } );
        Utils.eventEmitter.on( 'charts.update', () => {
            Events.chartsUpdate();
        } );
        Utils.eventEmitter.on( 'time.end', ( type, prevType ) => {
            if ( prevType === 'record' ) {
                Studio.releaseSong();
            }
        } );
        Battle.bindings();
    },
    run: () => {
        let currentActivity = Protagonist.get( 'activity' );
        let event = {};
        let eventTypes = [ 'life', 'promotions', 'drugs' ];
        let eventType = eventTypes[ Utils.randIndex( eventTypes.length ) ];

        if ( currentActivity === 'activity_record' ) {
            event = Data.studio[ Utils.randIndex( Data.studio.length ) ]
        } else {
            event = Data[ eventType ][ Utils.randIndex( Data[ eventType ].length ) ];
        }

        if ( Utils.isNullOrUndefined( event.update ) === false ) {
            Object.keys( event.update ).forEach( function ( key ) {
                let updatedValue = Protagonist.get( key ) + event.update[ key ].value;
                Protagonist.set( key, updatedValue );
            } );
        }

        if ( Utils.isNullOrUndefined( Events[ eventType ] ) === false ) {
            Events.current = event;
            Events[ eventType ]( event );
        }
    },
    rentDue: () => {
        Feed.add( 'eventRentDue', { rent: Settings.RENT_AMOUNT } );
        Protagonist.set( 'money', -Settings.RENT_AMOUNT, true );
    },
    chartsUpdate: () => {
        Feed.add( 'eventChartsUpdated' );
        Charts.update();
    },
    promotions: ( value ) => {
        Feed.event( value );
        Schedule.register( value );
    },
    drugs: ( value ) => {
        Feed.event( value );
    },
    life: ( value ) => {
        Feed.event( value );
    }
}

export default Events;