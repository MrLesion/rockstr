import * as Data from './Data.js';

import Utils from './Utils.js';
import Settings from '../Settings.js';
import Store from './Store.js';
import Protagonist from './Protagonist.js';
import Bands from './Bands.js';

const Songs = {
    model: () => {
        return {
            name: '',
            genre: '',
            song: '',
            quality: 0,
            myEntry: false,
            new: true,
            sales: 0,
            weeks: 1,
            weeksAsOne: 0,
            released: '',
            chartEvent: '',
            icons: [],
            position: 0,
            prevQuality: 0,
            prevPostion: 0
        }
    },
    construct: () => {
        let stored = Store.get( 'songs' );
        if(Utils.isNullOrUndefined(stored) === true){
            Store.set( 'songs', [] );
        }
        
    },
    get: ( song ) => {
        let stored = Store.get( 'songs' );
        if ( Utils.isNullOrUndefined( song ) === false ) {
            return stored.filter( ( song ) => {
                return song.song === song;
            } )[ 0 ];
        } else {
            return stored;
        }

    },
    set: ( songs ) => {
        Store.set( 'songs', songs );
    },
    add: ( title ) => {
        let songs = Store.get( 'songs' );
        let song = Songs.generate( title );
        songs.push( song );
        Songs.set( songs );
    },
    generate: ( title = '' ) => {
        let song = Songs.model();
        song.name = Protagonist.get( 'name' );
        song.genre = Protagonist.get( 'genre' );
        song.song = title || Bands.generateSong( Utils.randIndex( 5 ) );
        song.quality = Songs.getQuality();
        song.myEntry = true;
        return song;

    },
    getQuality: () => {
        let creativity = Protagonist.get( 'creativity' );
        let mentality = Protagonist.get( 'mentality' );
        return Utils.randRanking( ( creativity + mentality ) / 2 );
    }
};

export default Songs;