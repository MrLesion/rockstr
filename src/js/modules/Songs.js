import Settings from '../Settings.js';
import Utils from './Utils.js';
import Store from './Store.js';
import Protagonist from './Protagonist.js';
import Bands from './Bands.js';
import Time from './Time.js';

/* Vendor */
import * as moment from 'moment';

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
        if ( Utils.isNullOrUndefined( stored ) === true ) {
            Store.set( 'songs', [] );
        }

    },
    get: ( song ) => {
        let stored = Store.get( 'songs' );
        if ( Utils.isNullOrUndefined( song ) === false ) {
            return stored.filter(s => s.song === song)[ 0 ];
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
    update: ( entry ) => {
        let songs = Store.get( 'songs' );
        let oldEntryIndex = songs.findIndex( o => o.song === entry.song );
        songs[ oldEntryIndex ] = entry;
        Songs.set( songs );
    },
    generate: ( title = '', factor = 1, isUser = false ) => {
        let song = Songs.model();
        let songValues = {};
        let time = Time.today();
        if ( isUser === true ) {
            songValues.name = Protagonist.get( 'name' );
            songValues.genre = Protagonist.get( 'genre' );
        } else {
            let band = Bands.getBand();
            Object.assign( songValues, band );
        }

        songValues.song = title || Songs.generateTitle();
        songValues.quality = Songs.getQuality( isUser, factor );
        songValues.released = moment( time ).format( Settings.SCHEDULE_DATE_FORMAT );
        songValues.myEntry = isUser;
        Object.assign( song, songValues );

        return song;
    },
    generateTitle: () => {
        return Bands.generateSong( Utils.randIndex( 5 ) );
    },
    getQuality: ( isUser, factor ) => {
        let result = 0;
        factor = isUser ? factor : Utils.randInt( 9 );
        let fame = ( isUser ? Protagonist.get( 'fame' ) / Settings.FAME_PROGRESS_FACTOR : Utils.randInt( Settings.MAX_SONG_FACTOR ) ) / 2;
        let creativity = ( isUser ? Protagonist.get( 'creativity' ) : Utils.randInt( Settings.MAX_SONG_FACTOR ) ) / 2;
        let mentality = ( isUser ? Protagonist.get( 'mentality' ) : Utils.randInt( Settings.MAX_SONG_FACTOR ) ) / 2;
        let radRanking = Utils.randRanking( Settings.MAX_SONG_FACTOR );
        let hitModifier = Utils.randInt( 50 ) === 25 ? 5 : 0;
        result = Math.round( radRanking + ( ( fame + creativity + mentality ) * ( factor + hitModifier ) ) );
        return result;
    }
};

export default Songs;