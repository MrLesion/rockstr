import Data from '../Data.js';

import Constants from '../Constants.js';
import Store from './Store.js';
import Bands from './Bands.js';
import Studio from './Studio.js';
import Protagonist from './Protagonist.js';


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
        result *= Constants.MAX_SONG_FACTOR;
        result = Math.floor( result / Constants.MAX_SONG_FACTOR );
        return result;
    },
    adjustRanking: ( entry ) => {
        let result = 0;

        if ( entry.weeks < 5 ) {
            if ( Utils.randInt( 10 ) >= 5 ) {
                result = entry.prevQuality - Utils.randInt( Constants.MAX_SONG_FACTOR * 5 );
            } else {
                result = ( entry.prevQuality / 10 ) + Utils.randInt( Constants.MAX_SONG_FACTOR * 5 );
            }
        } else {
            entry = ( entry.prevQuality / 10 ) - Utils.randInt( Constants.MAX_SONG_FACTOR * 10 );
        }
        return result;
    },
    adjustSales: ( entry ) => {
        let result = entry.sales;
        result = Math.round( result + ( entry.quality / 100 + entry.quality / 100 ) * 2 );
        return Utils.calculateWithTax( result );
    },
    calculateWithTax: ( int ) => {
        let intWithTaxes = 0;
        intWithTaxes = int - ( int * Constants.TAX );
        return Math.round( intWithTaxes );
    },
    doDrugEffect: ( drug, addiction ) => {
        let drugFactor = Data.core.addictions[ drug ];
        let updateObj = {
            health: -( Utils.randInt( drugFactor.modifier + addiction.addictionLevel ) ),
            creativity: Utils.intNegPos( Utils.randInt( drugFactor.modifier + addiction.addictionLevel ) ),
            mentality: Utils.intNegPos( Utils.randInt( drugFactor.modifier + addiction.addictionLevel ) ),
            happiness: Utils.intNegPos( Utils.randInt( drugFactor.modifier + addiction.addictionLevel ) )
        };
        Utils.each( updateObj, ( prop, value ) => {
            Protagonist.set( prop, value, true );
        } );
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
    validateProtagonistValue: ( prop, value ) => {
        let statsProps = [ 'health', 'mentality', 'creativity', 'happiness' ];
        if ( statsProps.indexOf( prop ) > -1 ) {
            if ( value > 100 ) {
                value = 100;
            }
        }
        return value;
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
        let returnMsg = msg;
        if ( returnMsg.indexOf( '<-' ) > -1 && returnMsg.indexOf( '->' ) > -1 ) {
            let placeholders = returnMsg.match( /<-\w+->/g ).map( s => s );
            placeholders.forEach( ( placeholder ) => {
                let placeholderMap = placeholder.match( /<-(.*)->/ );
                if ( placeholderMap[ 1 ] === 'ANY' ) {
                    let anyPlaceholderMap = Data.jobs[ Utils.randIndex( Data.jobs.length ) ];
                    placeholderMap[ 0 ] = '<-' + anyPlaceholderMap + '->';
                    placeholderMap[ 1 ] = anyPlaceholderMap;
                }
                let placeholdeTag = placeholderMap[ 0 ];
                let placeholdeData = placeholderMap[ 1 ];
                let isNPC = Data.jobs.indexOf( placeholdeData ) > -1;
                if ( isNPC === true ) {
                    returnMsg = Utils.replaceNpc( returnMsg, placeholdeData, placeholdeTag );
                } else {
                    returnMsg = Utils.replaceMisc( returnMsg, placeholdeData, placeholdeTag );
                }
            } );
        }
        return returnMsg;
    },
    replaceNpc: ( msg, key, value ) => {
        let returnMsg = msg;
        let savedJobs = Store.get( 'jobs' ) || [];
        let hasNpc = false;
        let oldNpc = {};
        let newNpc = {};

        if ( Utils.isNullOrUndefined( savedJobs ) === false ) {
            savedJobs.forEach( function ( savedJob ) {
                if ( savedJob.job === key ) {
                    hasNpc = true
                    oldNpc.job = savedJob.job;
                    oldNpc.name = savedJob.name;
                }
            } );
        }
        if ( hasNpc === true ) {
            returnMsg = returnMsg.replace( value, oldNpc.name );
        } else {
            newNpc = Utils.generateNpc( key );
            if ( newNpc.name ) {
                returnMsg = returnMsg.replace( value, newNpc.name );
            }
            Store.add( 'jobs', newNpc )
        }
        return returnMsg;
    },
    replaceMisc: ( msg, key, value ) => {
        let returnMsg = msg;
        let replaceText = '';
        if ( key === 'songtitle' ) {
            replaceText = Studio.getNewTitle();
        } else if ( key === 'bandname' ) {
            replaceText = Bands.getBand().name;
        } else if ( key === 'usergenre' ) {
            replaceText = Protagonist.get( 'genre' );
        }
        returnMsg = returnMsg.replace( value, replaceText );
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
            let findNpc = savedJobs.filter( npc => npc.job === job );
            if ( findNpc.length ) {
                npc = findNpc[ 0 ];
            }
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
    each: ( obj, fnCallback ) => {
        if ( Utils.isNullOrUndefined( obj ) === false && typeof obj === 'object' && typeof fnCallback === 'function' ) {
            Object.keys( obj ).forEach( ( key ) => {
                fnCallback( key, obj[ key ] );
            } );
        }
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
                const index = Utils.eventEmitter._events[ event ].indexOf( listener );
                if ( index > -1 ) {
                    Utils.eventEmitter._events[ event ].splice( index, 1 );
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
    },
    customSelect: () => {
        let genericSelects = document.getElementsByTagName( 'select' );
        for ( let i = 0; i < genericSelects.length; i++ ) {
            let customSelectMarkup = document.createElement( 'ul' );
            customSelectMarkup.className = 'custom-select';
            customSelectMarkup.setAttribute( 'data-id', genericSelects[ i ].id );
            customSelectMarkup.setAttribute( 'data-selected', genericSelects[ i ].value );

            let genericOptions = genericSelects[ i ].options;
            for ( let x = 0; x < genericOptions.length; x++ ) {
                let customOptionMarkup = document.createElement( 'li' );
                customOptionMarkup.setAttribute( 'data-value', genericOptions[ x ].value );
                customOptionMarkup.innerText = genericOptions[ x ].innerText;
                customSelectMarkup.appendChild( customOptionMarkup );

            }
            genericSelects[ i ].style.display = 'none';
            genericSelects[ i ].parentNode.appendChild( customSelectMarkup );
            Utils.delegate( 'click', '.custom-select', ( event ) => {
                if ( event.target.className.indexOf( 'active' ) === -1 ) {
                    event.target.classList.add( 'active' );
                } else {
                    event.target.classList.remove( 'active' );
                }
            } );

        }
    }
};


export default Utils;
