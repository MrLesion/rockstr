import { TPL_EVENT_MODAL } from '../Templates.js';

import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Feed from './Feed.js';
import Protagonist from './Protagonist.js';
import Bands from './Bands.js';
import Charts from './Charts.js';
import Schedule from './Schedule.js';
import Modal from './Modal.js';
import Songs from './Songs.js';


const Events = {
    current: {},
    next: {},
    construct: () => {
        Events.bindings();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'rentDue', () => {
            Events.rentDue();
        } );
        Utils.eventEmitter.on( 'chartsUpdate', () => {
            Events.chartsUpdate();
        } );
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
        Feed.add( 'eventRentDue', { rent: Settings.RENT } );
        Protagonist.set( 'money', ( Protagonist.get( 'money' ) - Settings.RENT ) );
    },
    chartsUpdate: () => {
        Feed.add( 'eventChartsUpdated' );
        Charts.update();
    },
    promotions: ( value ) => {
        Feed.event( value );
        Schedule.register( value );
        console.log( 'event - promotions', value );
    },
    drugs: ( value ) => {
        Feed.event( value );
        console.log( 'event - drugs', value );
    },
    life: ( value ) => {
        Feed.event( value );
        console.log( 'event - life', value );
    },
    schedule: {
        run: ( scheduledEventObject ) => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            Object.keys( scheduledEventObject.questions ).forEach( ( questionKey ) => {
                let optionAction = scheduledEventObject.questions[ questionKey ].action;
                let options = scheduledEventObject.questions[ questionKey ].options;
                let editedOptions = options;
                if ( optionAction === 'addSongs' ) {
                    let songs = Songs.get();
                    for ( var i = 0; i < songs.length; i++ ) {
                        editedOptions.push( songs[ i ] );
                    }
                } else if ( optionAction === 'addBands' ) {
                    let allBands = Bands.getAllBands();
                    for ( let i = allBands.length - 1; i >= 0; i-- ) {
                        if ( allBands[ i ].genre === Protagonist.get( 'genre' ) ) {
                            editedOptions.push( allBands[ i ].name );
                        }

                    }
                }
            } );
            modalContainer.innerHTML = TPL_EVENT_MODAL( scheduledEventObject );
            Modal.show( () => {
                let firstQuestion = modalContainer.querySelector( '[data-step="0"]' );
                firstQuestion.classList.add( 'active' );
                Modal.bindEvents();
            } );
        }
    }
}

export default Events;