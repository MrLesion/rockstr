import * as Data from './Data.js';

import { TPL_NEWS_PANEL } from '../Templates.js';

import Settings from '../Settings.js';
import Fetch from './Fetch.js';
import Utils from './Utils.js';
import Time from './Time.js';

/* Vendor */
import * as moment from 'moment';

const News = {
    fetching: false,
    fetchedMonth: null,
    fetchedJSON: [],
    xhr: null,
    store: {
        date: '',
        nyt: []
    },
    construct: () => {
        News.bindings();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'news.get', () => {
            News.get();
        } );
    },
    set: () => {
        let daysNews = [];
        let date = moment( Time.get().date );
        News.fetchedJSON.forEach( ( element ) => {
            var elementDate = moment( element.pub_date );
            if ( elementDate.date() === date.date() && element.document_type === Settings.NYT_TYPE ) {
                if ( element.lead_paragraph !== null && element.lead_paragraph.length > 40 ) {
                    daysNews.push( element );
                }

            }
        } );
        News.store.nyt = Utils.sortByInt( daysNews, 'print_page' );
        News.store.nyt.length = 15;
        News.store.date = Time.get().date;
        if ( Settings.ACTIVE_MODULES_NEWS === true ) {
            News.build();
        }
    },
    get: () => {
        let date = moment( Time.get().date );
        let hasSavedMonth = false;

        if ( News.fetching === true ) {
            return;
        }

        if ( Utils.isNullOrUndefined( Data.news[ date.year() ] ) === false ) {
            if ( Utils.isNullOrUndefined( Data.news[ date.year() ][ ( date.month() + 1 ) ] ) === false ) {
                hasSavedMonth = true;
            }
        }

        if ( News.fetchedMonth !== ( date.month() + 1 ) ) {
            if ( News.xhr !== null ) {
                console.log( News.xhr.readyState, News.xhr.status );
            }
            if ( Settings.ACTIVE_MODULES_NEWS === true ) {
                News.fetching = true;
                if ( hasSavedMonth === false ) {
                    let newsApiUrl = Settings.NYT_ENDPOINT.replace( '{year}', date.year() ).replace( '{month}', ( date.month() + 1 ) ).replace( '{key}', Settings.NYT_APIKEY );

                    Fetch( newsApiUrl )
                        .then( ( data ) => {
                            News.fetchedJSON = data.response.docs;
                            console.log( '--- SAVE THIS ---' );
                            console.log( JSON.stringify( data.response.docs ) );
                            News.fetchedMonth = ( date.month() + 1 );
                            News.fetching = false;
                            News.set();
                        } );
                } else {
                    let localNewsJSONUrl = Settings.NYT_LOCAL_ENDPOINT.replace( '{file}', Data.news[ date.year() ][ ( date.month() + 1 ) ] );

                    Fetch( localNewsJSONUrl )
                        .then( ( json ) => {
                            News.fetchedJSON = json.data;
                            News.fetchedMonth = ( date.month() + 1 );
                            News.fetching = false;
                            News.set();
                        } );
                }
            }
        } else {
            News.set();
        }

    },
    build: () => {
        const container = document.querySelector( '.hbs-container-news' );
        container.innerHTML = TPL_NEWS_PANEL( News.store );
    }
}

export default News;