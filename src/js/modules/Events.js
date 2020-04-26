import { TPL_EVENT_MODAL, TPL_STUDIO } from '../Templates.js';

import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Feed from './Feed.js';
import Protagonist from './Protagonist.js';
import Bands from './Bands.js';
import Charts from './Charts.js';
import Schedule from './Schedule.js';
import Songs from './Songs.js';
import Time from './Time.js';


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
                Events.studio.releaseSong();
            }
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
    },
    drugs: ( value ) => {
        Feed.event( value );
    },
    life: ( value ) => {
        Feed.event( value );
    },
    schedule: {
        model: {},
        run: ( scheduledEventObject ) => {
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
            Events.schedule.build( scheduledEventObject );

        },
        build: ( scheduledEventObject ) => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            modalContainer.innerHTML = TPL_EVENT_MODAL( scheduledEventObject );
            Utils.eventEmitter.emit( 'modal.show', () => {
                Events.schedule.bindings( modalContainer );
            } );
        },
        bindings: ( modalContainer ) => {
            let firstQuestion = modalContainer.querySelector( '[data-step="0"]' );
            firstQuestion.classList.add( 'active' );

            let selects = modalContainer.querySelectorAll( 'select' );

            for ( var i = 0; i < selects.length; i++ ) {
                selects[ i ].addEventListener( 'change', ( event ) => {
                    let curStep = event.target.closest( '[data-step]' );
                    let curStepIndex = parseInt( curStep.dataset.step );
                    let nextStep = modalContainer.querySelector( '[data-step="' + ( curStepIndex + 1 ) + '"]' );
                    if ( Utils.isNullOrUndefined( nextStep ) === false ) {
                        curStep.classList.remove( 'active' );
                        nextStep.classList.add( 'active' );
                    } else {
                        Utils.eventEmitter.emit( 'modal.hide' );
                    }
                } );
            }

        }
    },
    studio: {
        model: {
            days: 0,
            song: '',
            temp: '',
            cost: 0,
            quality: 0
        },
        run: () => {
            Events.studio.model.days = Utils.randInt( 14 );
            Events.studio.model.cost = 0;
            Events.studio.model.quality = 0;

            let studios = Object.assign( {}, Data.core.record.studios );
            let producers = Object.assign( {}, Data.core.record.producers );

            let dataObj = {
                studios: studios,
                producers: producers,
                days: Events.studio.model.days
            };
            Events.studio.build( dataObj );
        },
        build: ( dataObj ) => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            modalContainer.innerHTML = TPL_STUDIO( dataObj );
            Utils.eventEmitter.emit( 'modal.show', () => {
                Events.studio.bindings( modalContainer );
                Events.studio.update();
            } );
        },
        bindings: ( modalContainer ) => {
            let generateSongTitle = modalContainer.querySelector( '.generate-song-title' );
            let saveSongTitle = modalContainer.querySelector( '.save-song-title' );
            let songTitleInput = modalContainer.querySelector( '#SongTitle' );
            let selects = modalContainer.querySelectorAll( '.recording-select' );

            for ( var i = 0; i < selects.length; i++ ) {
                ( ( x ) => {
                    selects[ x ].addEventListener( 'change', () => {
                        Events.studio.update();
                    }, false );
                } )( i );
            }

            generateSongTitle.addEventListener( 'click', () => {
                Events.studio.model.song = Songs.generateTitle();
                songTitleInput.value = Events.studio.model.song;
            } );

            saveSongTitle.addEventListener( 'click', () => {
                Events.studio.model.song = Events.studio.model.song || Songs.generateTitle();
                Utils.eventEmitter.emit( 'modal.hide' );
                Time.run( Events.studio.model.days, 'record' );
            } );
        },
        update: () => {
            let costElement = document.querySelector( '.studio-cost' );
            let studio = document.getElementById( 'studioSelect' );
            let producer = document.getElementById( 'producerSelect' );
            Events.studio.model.cost = 0;
            Events.studio.model.quality = 0;

            if ( studio.value !== '' ) {
                Events.studio.model.cost += parseInt( Data.core.record.studios[ studio.value ].cost * Events.studio.model.days );
                Events.studio.model.quality += parseInt( Data.core.record.studios[ studio.value ].quality );
            }
            if ( producer.value !== '' ) {
                Events.studio.model.cost += Data.core.record.producers[ producer.value ].cost;
                Events.studio.model.quality += Data.core.record.producers[ producer.value ].quality;
            }
            costElement.innerText = Events.studio.model.cost;
            Events.studio.setSelectableOptions();

        },
        setSelectableOptions: () => {
            let studio = document.getElementById( 'studioSelect' );
            let producer = document.getElementById( 'producerSelect' );
            let studioOptions = studio.getElementsByTagName( 'option' );
            let producerOptions = producer.getElementsByTagName( 'option' );
            let rentFactor = Math.ceil( Settings.RENT * ( Settings.RENTDUE % Events.studio.model.days ) );

            //console.log(rentFactor);

            for ( let i = 0; i < studioOptions.length; i++ ) {
                if ( studioOptions[ i ].value !== '' ) {
                    let values = studioOptions[ i ].dataset;
                    if ( ( ( parseInt( values.cost ) * Events.studio.model.days ) + Events.studio.model.cost ) > ( Protagonist.get( 'money' ) - rentFactor ) ) {
                        studioOptions[ i ].disabled = true;
                    } else {
                        studioOptions[ i ].disabled = false;
                    }
                }

            }
            for ( let i = 0; i < producerOptions.length; i++ ) {
                if ( producerOptions[ i ].value !== '' ) {
                    let values = producerOptions[ i ].dataset;
                    if ( ( parseInt( values.cost ) + Events.studio.model.cost ) > ( Protagonist.get( 'money' ) - rentFactor ) ) {
                        producerOptions[ i ].disabled = true;
                    } else {
                        producerOptions[ i ].disabled = false;
                    }
                }

            }
        },
        getNewTitle: () => {
            let newSongTitle = Songs.generateTitle();
            Events.studio.model.temp = newSongTitle;
            return newSongTitle;
        },
        acceptNewTitle: () => {
            Events.studio.model.song = Events.studio.model.temp;
            Events.studio.model.temp = '';
        },
        releaseSong: () => {
            //let factors = Events.studio.model;
            let song = Songs.generate( Events.studio.model.song, Events.studio.model.quality, true );
            let cost = Events.studio.model.cost;
            Events.studio.reset();
            Protagonist.set( 'money', ( Protagonist.get( 'money' ) - cost ) );
            let songs = Songs.get();
            songs.push( song );
            Songs.set( songs );

            Feed.add( 'event_studio_release', { song: song.song, cost: cost } );
        },
        reset: () => {
            Events.studio.model.song = '';
            Events.studio.model.temp = '';
            Events.studio.model.days = 0;
            Events.studio.model.cost = 0;
            Events.studio.model.quality = 0;
        }
    }
}

export default Events;