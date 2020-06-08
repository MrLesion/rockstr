import { TPL_CHARTS_PANEL } from '../Templates.js';

import Utils from './Utils.js';
import Constants from '../Constants.js';
import Bands from './Bands.js';
import Songs from './Songs.js';
import Store from './Store.js';
import Feed from './Feed.js';


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
        if ( Utils.isNullOrUndefined(list) === false ) {
            Charts.model.list = list;
        }
        Store.set( 'charts', Charts.model );
        Charts.buildCharts();
    },
    generateCharts: ( list ) => {
        let chartList = list || [];
        let newList = [];
        let userSongs = Songs.get();

        for ( let i = 0; i < Constants.CHARTS_LENGTH; i++ ) {
            const entry = Charts.addEntry();
            newList.push( entry );
        }
        let newConcatList = chartList.concat( newList, userSongs );
        newConcatList = Charts.handleCharts( newConcatList );
        return newConcatList;

    },
    handleCharts: ( list ) => {
        let sortedList = Utils.sortByInt( list, 'quality' );
        sortedList.length = Constants.CHARTS_LENGTH;
        sortedList.forEach( ( entry, i ) => {
            if ( entry.quality > 0 ) {
                entry.position = ( i + 1 );
                if ( entry.position === 1 && entry.prevPostion <= 1 ) {
                    entry.weeksAsOne = entry.weeksAsOne + 1;
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
        chartEntry.quality = Utils.adjustRanking( chartEntry );
        chartEntry.presales = chartEntry.sales;
        chartEntry.sales = Utils.adjustSales( chartEntry );
        chartEntry.icons = Charts.addIcons( chartEntry );
        return chartEntry;
    },
    addIcons: ( chartEntry ) => {
        let icons = [];
        if ( chartEntry.new === true ) {
            icons.push( Constants.CHARTS_ICON_NEW );
        }
        if ( chartEntry.myEntry === true ) {
            icons.push( Constants.CHARTS_ICON_MYENTRY );
        }
        if ( chartEntry.weeksAsOne > 0 ) {
            icons.push( Constants.CHARTS_ICON_WEEKSASONE + chartEntry.weeksAsOne );
        }
        if ( chartEntry.sales >= Constants.CHARTS_SALES_GOLD_LIMIT && chartEntry.sales < Constants.CHARTS_SALES_PLATINIUM_LIMIT ) {
            icons.push( Constants.CHARTS_ICON_GOLD );
        }
        if ( chartEntry.sales >= Constants.CHARTS_SALES_PLATINIUM_LIMIT && chartEntry.sales < Constants.CHARTS_SALES_DOUBLE_PLATINIUM_LIMIT ) {
            icons.push( Constants.CHARTS_ICON_PLATINIUM );
        }
        if ( chartEntry.sales >= Constants.CHARTS_SALES_DOUBLE_PLATINIUM_LIMIT ) {
            icons.push( Constants.CHARTS_ICON_DOUBLEPLATINIUM );
        }
        return icons;
    },
    addEntry: () => {
        let chartEntry = Songs.generate();
        return chartEntry;
    },
    handleUserEntry: ( entry, index ) => {
        entry = Charts.updateEntry( entry, index )
        Feed.add( 'charts_user_entry', entry );
        //let money = Protagonist.get( 'money' );
        //let fame = Protagonist.get( 'fame' );
        //let earnedMoney = ( entry.sales - entry.presales ) * Constants.AMOUNT_PER_SALE;
        //let earnedFame = ( entry.sales - entry.presales ) / 2;
        //Protagonist.set( 'money', earnedMoney );
        //Protagonist.set( 'fame', earnedFame );
        Songs.update( entry );
        return entry;
    },
    update: () => {
        let list = Charts.get();
        Bands.createBand();
        list.forEach( ( entry, i ) => {
            if ( entry.myEntry === true ) {
                entry = Charts.handleUserEntry( entry, i );
            } else {
                entry = Charts.updateEntry( entry, i );
            }
        } );
        list = Charts.generateCharts( list );
        Charts.set( list );
    }
}

export default Charts;