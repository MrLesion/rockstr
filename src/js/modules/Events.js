import { TPL_EVENT_INTERVIEW_MODAL, TPL_EVENT_BATTLE_MODAL, TPL_STUDIO } from '../Templates.js';

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
        Feed.add( 'eventRentDue', { rent: Settings.RENT_AMOUNT } );
        Protagonist.set( 'money', ( Protagonist.get( 'money' ) - Settings.RENT_AMOUNT ) );
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
            console.log( 'scheduledEventObject', scheduledEventObject );
            if ( scheduledEventObject.promotion === 'battle' ) {
                Events.schedule.createBattle( 'battle' );
                Events.battle.run();
            } else if ( scheduledEventObject.promotion === 'interview' ) {
                Events.schedule.createInterview( 'interview', scheduledEventObject );
            }


        },
        createInterview: ( type, scheduledEventObject ) => {
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
            Events.schedule.build( type, scheduledEventObject );
        },
        build: ( type, eventObj ) => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            if ( type === 'battle' ) {
                modalContainer.innerHTML = TPL_EVENT_BATTLE_MODAL( eventObj );
            } else if ( type === 'interview' ) {
                modalContainer.innerHTML = TPL_EVENT_INTERVIEW_MODAL( eventObj );
            }

            Utils.eventEmitter.emit( 'modal.show', () => {
                Events.schedule.bindings( type, modalContainer );
            } );
        },
        bindings: ( type, modalContainer ) => {
            if ( type === 'battle' ) {
                console.log( type );
            } else if ( type === 'interview' ) {
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
        }
    },
    battle: {
        _temp: {
            weapons: [ 'lyrics', 'skills', 'arrogance' ],
            feed: []
        },
        create: () => {
            let battleObject = {
                turn: Utils.randInt( 6 ) > 3 ? 'player' : 'opponent'
            };
            let band = Bands.getBand();
            let player = {
                name: Protagonist.get( 'name' ),
                genre: Protagonist.get( 'genre' ),
                health: Protagonist.get( 'health' ),
                creativity: Protagonist.get( 'creativity' ),
                mentality: Protagonist.get( 'mentality' ),
                fame: Protagonist.get( 'fame' ) / Settings.FAME_PROGRESS_FACTOR * 100
            };
            let opponent = {
                name: band.name,
                genre: band.genre,
                health: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) ),
                creativity: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) ),
                mentality: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) ),
                fame: Math.floor( Utils.randInt( Settings.BATTLE_MAX_POWER ) )
            };
            Object.assign( battleObject, { player: player } );
            Object.assign( battleObject, { opponent: opponent } );
            return battleObject;
        },
        run: () => {
            let battleObject = Events.battle.create();
            Object.assign( Events.battle._temp, battleObject );
            Events.battle.build();
            Utils.eventEmitter.emit( 'modal.show', () => {
                Events.battle.bindings();
            } );
        },
        build: () => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            let data = Object.assign( {}, Events.battle._temp );
            data.feed = data.feed.reverse();
            modalContainer.innerHTML = TPL_EVENT_BATTLE_MODAL( data );
        },
        bindings: () => {
            Utils.eventEmitter.on( 'event.battle.ready', () => {
                if ( Events.battle._temp.turn === 'opponent' ) {
                    Events.battle.attack( false );
                }
            } );
            Utils.eventEmitter.on( 'event.battle.turn', ( currentTurn ) => {
                Events.battle.changeTurn( currentTurn );
            } );
            Utils.eventEmitter.on( 'event.battle.end', ( winner ) => {
                Events.battle.end( winner );
            } );
            Utils.delegate( 'click', '.event-battle-action', ( event ) => {
                let action = event.target.dataset.action;
                Events.battle.attack( true, action );
            } );
            Utils.eventEmitter.emit( 'event.battle.ready' );
        },
        attack: ( isUser, type = '' ) => {
            if ( type === '' ) {
                type = Events.battle._temp.weapons[ Utils.randIndex( Events.battle._temp.weapons.length ) ];
            }
            let power = Utils.rpgAttack( isUser, type );
            if ( isUser === false ) {
                setTimeout( () => {
                    Events.battle.fight( isUser, power, type );
                }, 1000 );
            } else {
                Events.battle.fight( isUser, power, type );
            }

        },
        fight: ( isUser, power, type ) => {
            let defense = Utils.randInt( Settings.BATTLE_MAX_POWER );
            let outcome = '';
            let attacker = isUser ? Events.battle._temp.player : Events.battle._temp.opponent;
            let defender = isUser ? Events.battle._temp.opponent : Events.battle._temp.player;
            if ( power > defense ) {
                outcome = '<strong> ' + attacker.name + '</strong> HITS with a ' + type + ' attack of ' + power + ' against <strong>' + defender.name + '</strong> defense of ' + defense;
                if ( isUser ) {
                    Events.battle._temp.opponent.health -= Math.floor( power - defense );
                } else {
                    Events.battle._temp.player.health -= Math.floor( power - defense );
                }
            } else {
                outcome = '<strong>' + attacker.name + '</strong> MISSES with a ' + type + ' attack of ' + power + ' against <strong>' + defender.name + '</strong>  defense of ' + defense;
            }
            Events.battle._temp.feed.push( outcome );
            if ( Events.battle._temp.opponent.health <= 0 ) {
                Utils.eventEmitter.emit( 'event.battle.end', 'player' );
            } else if ( Events.battle._temp.player.health <= 0 ) {
                Utils.eventEmitter.emit( 'event.battle.end', 'opponent' );
            } else {
                Utils.eventEmitter.emit( 'event.battle.turn', Events.battle._temp.turn );
            }

        },
        changeTurn: ( currentTurn ) => {
            Events.battle._temp.turn = currentTurn === 'player' ? 'opponent' : 'player';
            Events.battle.build();
            Utils.eventEmitter.emit( 'event.battle.ready' );
        },
        end: ( winner ) => {
            let prize = {
                money: Utils.randInt( Settings.BATTLE_PRIZE_MONEY ),
                fame: Utils.randInt( Settings.BATTLE_PRIZE_FAME )
            };
            Events.battle._temp.feed.push( 'The Winner is: ' + Events.battle._temp[ winner ].name + '<br />' + Events.battle._temp[ winner ].name + ' wins the prize money (£' + prize.money + ')' );
            Events.battle.build();
            if ( winner === 'player' ) {
                Protagonist.set( 'money', ( Protagonist.get( 'money' ) + prize.money ) );
                Protagonist.set( 'fame', ( Protagonist.get( 'fame' ) + prize.money ) );
            }
            Events.battle.reset();
            setTimeout( () => {
                Utils.eventEmitter.emit( 'modal.hide');
            }, Settings.BATTLE_END_TIMEOUT );
        },
        reset: () => {
            console.log('reset');
            Events.battle._temp.feed = [];
            Utils.eventEmitter.removeListener( 'event.battle.ready' );
            Utils.eventEmitter.removeListener( 'event.battle.turn' );
            Utils.eventEmitter.removeListener( 'event.battle.end' );
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
            Events.studio.model.days = Utils.randInt( Settings.EVENTS_STUDIO_DAYS_INTERVAL );
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
            let rentFactor = Math.ceil( Settings.RENT_AMOUNT * ( Settings.RENT_DUE_INTERVAL % Events.studio.model.days ) );

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