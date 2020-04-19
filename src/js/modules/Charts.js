import {TPL_CHARTS_PANEL} from '../Templates.js';

import Utils from './Utils.js';
import Settings from '../Settings.js';
import Bands from './Bands.js';
import Songs from './Songs.js';
import Store from './Store.js';

/* Vendor */
import * as moment from 'moment';


const Charts = {
    model: {},
    construct: () => {
        console.log( 'chartsConstruct' );
        Charts.model.list = Charts.get();
        Charts.set();
    },
    get: () => {
        let stored = Store.get( 'charts' );
        console.log( 'chartsGet', stored );
        if ( Utils.isNullOrUndefined( stored ) === true ) {
            return Charts.generateCharts();
        } else {
            return stored.list;
        }
    },
    set: ( list ) => {
        if ( list ) {
            Charts.model.list = list;
        }
        Store.set( 'charts', Charts.model );
        Charts.buildCharts();
    },
    generateCharts: ( list ) => {
        let chartList = list || [];
        let newList = [];
        let userSongs = Songs.get();

        for ( let i = 0; i < 20; i++ ) {
            const entry = Charts.addEntry();
            newList.push( entry );
        }
        let newConcatList = chartList.concat( newList, userSongs );
        newConcatList = Charts.sortCharts( newConcatList );
        newConcatList.length = 10;
        return newConcatList;

    },
    sortCharts: ( list ) => {
        let sortedList = Utils.sortByInt( list, 'quality' );
        sortedList.forEach( ( entry, i ) => {
            if ( entry.quality > 0 ) {
                entry.position = ( i + 1 );
                if ( entry.position > entry.prevPostion ) {
                    entry.chartEvent = 'down';
                } else if ( entry.position < entry.prevPostion ) {
                    entry.chartEvent = 'up';
                } else {
                    entry.chartEvent = 'stay';
                    if ( entry.position === 1 && entry.prevPostion === 1 ) {
                        entry.weeksAsOne = entry.weeksAsOne + 1;
                    }
                }
            } else {
                entry.removed = true;
            }
        } );
        return sortedList;
    },
    buildCharts: () => {
        const container = document.querySelector( '.hbs-container-charts' );
        container.innerHTML = TPL_CHARTS_PANEL( Charts.model.list );
    },
    updateEntry: ( chartEntry, index ) => {
        chartEntry.prevQuality = parseInt( chartEntry.quality );
        chartEntry.prevPostion = ( index + 1 );
        chartEntry.new = false;
        chartEntry.weeks = chartEntry.weeks + 1;
        chartEntry.quality = chartEntry.weeks < 10 ? Utils.randInt( 10 ) >= 5 ? ( chartEntry.prevQuality - Utils.randInt( 500 ) ) : ( ( chartEntry.prevQuality / 10 ) + Utils.randInt( 500 ) ) : ( ( chartEntry.prevQuality / 10 ) - Utils.randInt( 500 ) );
        chartEntry.sales = parseInt( chartEntry.sales + ( ( chartEntry.quality / 10 ) * 7 ) + ( ( chartEntry.quality / 10 ) * 2 ) );
        chartEntry.icons = Charts.addIcons( chartEntry );
        return chartEntry;
    },
    addIcons: ( chartEntry ) => {
        let icons = [];
        if ( chartEntry.new === true ) {
            icons.push( Settings.CHARTICON_NEW );
        }
        if ( chartEntry.myEntry === true ) {
            icons.push( Settings.CHARTICON_MYENTRY );
        }
        if ( chartEntry.weeksAsOne > 0 ) {
            icons.push( Settings.CHARTICON_WEEKSASONE + chartEntry.weeksAsOne );
        }
        if ( chartEntry.sales >= 100000 && chartEntry.sales < 180000 ) {
            icons.push( Settings.CHARTICON_GOLD );
        }
        if ( chartEntry.sales >= 180000 && chartEntry.sales < 225000 ) {
            icons.push( Settings.CHARTICON_PLATINIUM );
        }
        if ( chartEntry.sales >= 225000 ) {
            icons.push( Settings.CHARTICON_DOUBLEPLATINIUM );
        }
        return icons;
    },
    addEntry: () => {
        let chartEntry = {};
        let band = Bands.getBand();
        let time = Utils.isNullOrUndefined( Store.get( 'time' ) ) === false ? Store.get( 'time' ).date : Settings.STARTDATE;
        Object.assign( chartEntry, band )
        chartEntry.song = Bands.generateSong( Utils.randIndex( 5 ) );
        chartEntry.quality = Utils.randRanking( 100 );
        chartEntry.myEntry = false;
        chartEntry.new = true;
        chartEntry.sales = 0;
        chartEntry.weeks = 1;
        chartEntry.weeksAsOne = 0;
        chartEntry.released = moment( time ).format( 'YYYY-MM-DD' );
        chartEntry.chartEvent = '';
        chartEntry.icons = Charts.addIcons( chartEntry );
        return chartEntry;
    },
    update: () => {
        let list = Charts.get();
        Bands.createBand();
        list.forEach( ( entry, i ) => {
            entry = Charts.updateEntry( entry, i );
        } );
        list = Charts.generateCharts( list );
        console.log( 'chartsUpdate', list );
        Charts.set( list );
    }
}

export default Charts;