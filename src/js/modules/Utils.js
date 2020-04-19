import * as Data from './Data.js';

import Store from './Store.js';
import Songs from './Songs.js';

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
        return Math.pow( Math.floor( Math.random() * int ), 2 );
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
                } else{

                    if(placeholdeData === 'songtitle'){
                        let newSongTitle = Songs.generate();
                        msg = msg.replace( placeholdeTag, newSongTitle.song);
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
        events: {},
        on( event, listener ) {
            if ( typeof Utils.eventEmitter.events[ event ] !== 'object' ) {
                Utils.eventEmitter.events[ event ] = [];
            }
            Utils.eventEmitter.events[ event ].push( listener );
            return () => Utils.eventEmitter.removeListener( event, listener );
        },
        removeListener( event, listener ) {
            if ( typeof Utils.eventEmitter.events[ event ] === 'object' ) {
                const idx = Utils.eventEmitter.events[ event ].indexOf( listener );
                if ( idx > -1 ) {
                    Utils.eventEmitter.events[ event ].splice( idx, 1 );
                }
            }
        },
        emit( event, ...args ) {
            if ( typeof Utils.eventEmitter.events[ event ] === 'object' ) {
                Utils.eventEmitter.events[ event ].forEach( listener => listener.apply( Utils.eventEmitter, args ) );
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