import * as Data from './Data.js';

import Settings from '../Settings.js';
import Store from './Store.js';
import Bands from './Bands.js';
import Events from './Events.js';

const Utils = {
    objectIsEmpty: ( obj ) => {
        return Utils.isNullOrUndefined( obj ) ? true : Object.keys( obj ).length === 0;
    },
    isNullOrUndefined: ( obj ) => {
        return obj === null || obj === undefined;
    },
    randIndex: ( length ) => {
        return Math.floor( Math.random() * length );
    },
    randInt: ( int, factor = 1 ) => {
        return Math.floor( ( Math.floor( Math.random() * int ) + 1 ) * factor );
    },
    randRanking: ( int ) => {
        let result = Math.random() * int;
        result = result * result;
        result *= Settings.MAX_SONG_FACTOR;
        result = Math.floor( result / Settings.MAX_SONG_FACTOR );
        return result;
    },
    adjustRanking: ( entry ) => {
        let result = 0;

        if ( entry.weeks < 5 ) {
            if ( Utils.randInt( 10 ) >= 5 ) {
                result = entry.prevQuality - Utils.randInt( Settings.MAX_SONG_FACTOR * 5 );
            } else {
                result = ( entry.prevQuality / 10 ) + Utils.randInt( Settings.MAX_SONG_FACTOR * 5 );
            }
        } else {
            entry = ( entry.prevQuality / 10 ) - Utils.randInt( Settings.MAX_SONG_FACTOR * 10 );
        }

        return result;
    },
    adjustSales: ( entry ) => {
        let result = entry.sales;
        result = Math.round( result + ( entry.quality / 100 + entry.quality / 100 ) * 2 );
        return result;
    },
    intNegPos: ( int ) => {
        int *= Math.floor( Math.random() * 2 ) === 1 ? 1 : -1;
        return int;
    },
    shuffleArr: ( array ) => {
        let counter = array.length;
        while ( counter > 0 ) {
            let index = Math.floor( Math.random() * counter );
            counter--;
            let temp = array[ counter ];
            array[ counter ] = array[ index ];
            array[ index ] = temp;
        }
        return array;
    },
    sortByInt: ( array, intKey ) => {
        return array.sort( ( a, b ) => {
            return parseInt( b[ intKey ] ) - parseInt( a[ intKey ] );
        } );
    },
    capitalizer: ( str ) => {
        var pieces = str.split( ' ' );
        for ( var i = 0; i < pieces.length; i++ ) {
            var j = pieces[ i ].charAt( 0 ).toUpperCase();
            pieces[ i ] = j + pieces[ i ].substr( 1 ).toLowerCase();
        }
        return pieces.join( " " );
    },
    replacePlaceholder: ( msg ) => {
        let returnMsg = '';
        let newNpc = {};
        let savedJobs = Store.get( 'jobs' ) || [];
        if ( msg.indexOf( '<-' ) > -1 && msg.indexOf( '->' ) > -1 ) {
            let placeholders = msg.match( /<-\w+->/g ).map( s => s );

            placeholders.forEach( ( placeholder ) => {
                let placeholderMap = placeholder.match( /<-(.*)->/ );
                let placeholdeTag = placeholderMap[ 0 ];
                let placeholdeData = placeholderMap[ 1 ];
                let isNPC = Data.jobs.indexOf( placeholdeData ) > -1;

                if ( isNPC === true ) {
                    let hasNpc = false;
                    let oldNpc = {};

                    if ( Utils.isNullOrUndefined( savedJobs ) === false ) {
                        savedJobs.forEach( function ( savedJob ) {
                            if ( savedJob.job === placeholdeData ) {
                                hasNpc = true
                                oldNpc.job = savedJob.job;
                                oldNpc.name = savedJob.name;
                            }
                        } );
                    }

                    if ( hasNpc === true ) {
                        msg = msg.replace( placeholdeTag, oldNpc.name );
                    } else {
                        newNpc = Utils.generateNpc( placeholdeData );
                        if ( newNpc.name ) {
                            msg = msg.replace( placeholdeTag, newNpc.name );
                        }
                        savedJobs.push( newNpc );
                        Store.set( 'jobs', savedJobs );
                    }
                } else {
                    if ( placeholdeData === 'songtitle' ) {
                        let newSongTitle = Events.studio.getNewTitle();
                        msg = msg.replace( placeholdeTag, newSongTitle );
                    } else if ( placeholdeData === 'bandname' ) {
                        let bandname = Bands.getBand();
                        msg = msg.replace( placeholdeTag, bandname.name );
                    }
                }
            } );
        }
        returnMsg = msg;
        return returnMsg;
    },
    generateNpc: ( myJob ) => {
        let name = Data.names.first[ Utils.randIndex( Data.names.first.length ) ] + ' ' + Data.names.last[ Utils.randIndex( Data.names.last.length ) ],
            job = myJob || Data.jobs[ Utils.randIndex( Data.jobs.length ) ],
            npc = {
                name: name,
                job: job
            };
        return npc;
    },
    getNpc: ( job ) => {
        let savedJobs = Store.get( 'jobs' ) || [];
        let npc = {};

        if ( Utils.isNullOrUndefined( savedJobs ) === false ) {
            npc = savedJobs.filter( ( npc ) => {
                return npc.job === job;
            } )[ 0 ];
        }
        if ( Utils.objectIsEmpty( npc ) === true ) {
            npc = Utils.generateNpc( job );
            savedJobs.push( npc );
            Store.set( 'jobs', savedJobs );
        }
        return npc.name;
    },
    delegate: ( event, selector, callback ) => {
        document.addEventListener( event, function ( e ) {
            for ( var target = e.target; target && target !== this; target = target.parentNode ) {
                if ( target.matches( selector ) ) {
                    callback.call( target, e );
                    break;
                }
            }
        }, false );
    },
    eventEmitter: {
        _events: {},
        on( event, listener ) {
            if ( typeof Utils.eventEmitter._events[ event ] !== 'object' ) {
                Utils.eventEmitter._events[ event ] = [];
            }
            Utils.eventEmitter._events[ event ].push( listener );
            return () => Utils.eventEmitter.removeListener( event, listener );
        },
        removeListener( event, listener ) {
            if ( typeof Utils.eventEmitter._events[ event ] === 'object' ) {
                const idx = Utils.eventEmitter._events[ event ].indexOf( listener );
                if ( idx > -1 ) {
                    Utils.eventEmitter._events[ event ].splice( idx, 1 );
                }
            }
        },
        emit( event, ...args ) {
            if ( typeof Utils.eventEmitter._events[ event ] === 'object' ) {
                Utils.eventEmitter._events[ event ].forEach( listener => listener.apply( Utils.eventEmitter, args ) );
            }
        },
        once( event, listener ) {
            const remove = Utils.eventEmitter.on( event, ( ...args ) => {
                remove();
                listener.apply( Utils.eventEmitter, args );
            } );
        }
    }
};


export default Utils;