import { TPL_EVENT_INTERVIEW_MODAL, TPL_EVENT_BATTLE_MODAL, TPL_STUDIO } from '../Templates.js';

import * as Data from './Data.js';

import Settings from '../Settings.js';
import Models from '../Models.js';
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
        Events.battle.bindings();
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
            Events.schedule.build( scheduledEventObject );
        },
        build: ( eventObj ) => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            modalContainer.innerHTML = TPL_EVENT_INTERVIEW_MODAL( eventObj );

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
    battle: {
        model: {},
        create: () => {
            Object.assign( Events.battle.model, Models.battle() );

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
            Object.assign( Events.battle.model, battleObject );
        },
        run: () => {
            Events.battle.create();
            Events.battle.build();
            Utils.eventEmitter.emit( 'modal.show', () => {
                Utils.eventEmitter.emit( 'event.battle.ready' );
            } );
        },
        build: () => {
            let modalContainer = document.querySelector( '.modal-backdrop' );
            let data = Object.assign( {}, Events.battle.model );
            //data.feed = data.feed.reverse();
            modalContainer.innerHTML = TPL_EVENT_BATTLE_MODAL( data );
        },
        bindings: () => {
            Utils.eventEmitter.on( 'event.battle.ready', () => {
                if ( Events.battle.model.turn === 'opponent' ) {
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
        },
        attack: ( isUser, type = '' ) => {
            if ( type === '' ) {
                type = Events.battle.model.attacks[ Utils.randIndex( Events.battle.model.attacks.length ) ];
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
            let outcome = Object.assign( {}, Models.fight() );
            let attacker = isUser ? Events.battle.model.player : Events.battle.model.opponent;
            let defender = isUser ? Events.battle.model.opponent : Events.battle.model.player;

            outcome.attacker = attacker;
            outcome.type = type;
            outcome.power = power;
            outcome.defender = defender;
            outcome.defense = defense;

            if ( power > defense ) {
                outcome.hit = true;
                if ( isUser ) {
                    Events.battle.model.opponent.health -= Math.floor( power - defense );
                } else {
                    Events.battle.model.player.health -= Math.floor( power - defense );
                }
            } else {
                outcome.hit = false;
            }
            Events.battle.model.feed.unshift( outcome );
            if ( Events.battle.model.opponent.health <= 0 ) {
                Utils.eventEmitter.emit( 'event.battle.end', 'player' );
            } else if ( Events.battle.model.player.health <= 0 ) {
                Utils.eventEmitter.emit( 'event.battle.end', 'opponent' );
            } else {
                Utils.eventEmitter.emit( 'event.battle.turn', Events.battle.model.turn );
            }

        },
        changeTurn: ( currentTurn ) => {
            Events.battle.model.turn = currentTurn === 'player' ? 'opponent' : 'player';
            Events.battle.build();
            Utils.eventEmitter.emit( 'event.battle.ready' );
        },
        end: ( winner ) => {
            let prize = {
                money: Utils.randInt( Settings.BATTLE_PRIZE_MONEY ),
                fame: Utils.randInt( Settings.BATTLE_PRIZE_FAME )
            };
            let outcome = Object.assign( {}, Models.fight() );

            outcome.winner = Events.battle.model[ winner ].name;
            outcome.prize = prize.money;
            outcome.isAttack = false;

            Events.battle.model.feed.unshift( outcome );
            Events.battle.build();
            if ( winner === 'player' ) {
                Protagonist.updateValue('money', prize.money );
                Protagonist.updateValue('fame', prize.fame );
            }
            Events.battle.reset();
            setTimeout( () => {
                Utils.eventEmitter.emit( 'modal.hide' );
            }, Settings.BATTLE_END_TIMEOUT );
        },
        reset: () => {
            Events.battle.model.feed = [];
        }
    },
    studio: {
        model: {},
        run: () => {
            Object.assign( Events.studio.model, Models.studio() );
            Events.studio.model.days = Utils.randInt( Settings.EVENTS_STUDIO_DAYS_INTERVAL );
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