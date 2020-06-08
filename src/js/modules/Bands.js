import Data from '../Data.js';

import Utils from './Utils.js';
import Store from './Store.js';

const Bands = {
    construct: () => {
        Data.genres.forEach( ( genre ) => {
            Bands.createBand( genre );
        } );
    },
    createBand: ( genre = null ) => {
        let savedBands = Store.get( 'bands' );
        if ( Utils.isNullOrUndefined( savedBands ) === true ) {
            savedBands = [];
        }
        let band = Bands.generateBand( genre );
        savedBands.push( band );
        Store.set( 'bands', savedBands );

    },
    generateBand: ( genre = null ) => {
        let bandname = 'null';
        let bandgenre = Utils.isNullOrUndefined( genre ) ? Data.genres[ Utils.randIndex( Data.genres.length ) ] : genre;
        let setter = Utils.randInt( 20 );

        if ( setter > 0 && setter < 3 ) {
            bandname = Data.names.first[ Utils.randIndex( Data.names.first.length ) ] + ' ' + Data.names.last[ Utils.randIndex( Data.names.last.length ) ];
        } else if ( setter >= 3 && setter < 6 ) {
            bandname = 'The ' + Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ];
        } else if ( setter >= 6 && setter < 10 ) {
            bandname = 'The ' + Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ];
        } else if ( setter >= 10 && setter < 15 ) {
            bandname = Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ];
        } else if ( setter >= 15 ) {
            bandname = 'The ' + Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ] + 'ing ' + Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ];
        }
        if ( bandname ) {
            let newBand = {
                name: Utils.capitalizer( bandname ),
                genre: Utils.capitalizer( bandgenre )
            };
            return newBand;
        }
    },
    getBand: () => {
        let allBands = Bands.getAllBands();
        let bands = Utils.shuffleArr( allBands );
        return bands[ Utils.randIndex( bands.length - 1 ) ];
    },
    getAllBands: () => {
        let savedBands = Store.get( 'bands' );
        if ( Utils.isNullOrUndefined( savedBands ) === true ) {
            savedBands = [];
        }
        let standardBands = Data.bands;
        let allBands = standardBands.concat( savedBands );
        return allBands;
    },
    generateSong: ( length ) => {
        let song = '';
        if ( length === 0 ) {
            song = 'The ' + Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ];
        } else if ( length === 1 ) {
            song = Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ];
        } else if ( length === 2 ) {
            song = Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ] + ' ' + Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ];
        } else if ( length === 3 ) {
            song = Data.words.subject[ Utils.randIndex( Data.words.subject.length ) ] + ' ' + Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ] + ' ' + Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ];
        } else if ( length === 4 ) {
            song = Data.words.subject[ Utils.randIndex( Data.words.subject.length ) ] + ' ' + Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ] + ' ' + Data.words.object[ Utils.randIndex( Data.words.object.length ) ] + ' ' + Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ];
        } else {
            song = Data.words.verb[ Utils.randIndex( Data.words.verb.length ) ].split().join( '.' );
        }
        return song;
    }
};


export default Bands;
