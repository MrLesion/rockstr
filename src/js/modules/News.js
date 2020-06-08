import { TPL_NEWS_PANEL } from '../Templates.js';

import Constants from '../Constants.js';
import Fetch from './Fetch.js';
import Utils from './Utils.js';
import Time from './Time.js';

/* Vendor */
import * as moment from 'moment';

const News = {
    fetching: false,
    fetchedMonth: null,
    fetchedJSON: [],
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
            if ( elementDate.date() === date.date() && element.document_type === Constants.NYT_TYPE ) {
                if ( element.lead_paragraph !== null && element.lead_paragraph.length > 40 ) {
                    daysNews.push( element );
                }

            }
        } );
        News.store.nyt = Utils.sortByInt( daysNews, 'print_page' );
        News.store.nyt.length = 15;
        News.store.date = Time.get().date;
        if ( Constants.ACTIVE_MODULES_NEWS === true ) {
            News.build();
        }
    },
    get: () => {
        let date = moment( Time.get().date );
        if ( News.fetching === true ) {
            return;
        }
        if ( News.fetchedMonth !== ( date.month() + 1 ) ) {
            if ( Constants.ACTIVE_MODULES_NEWS === true ) {
                News.fetching = true;
                let newsApiEndpoint = Constants.NYT_LOCAL_ENDPOINT.replace( '{file}', date.year() + '-' + ( date.month() + 1 ) ).replace( '{year}', date.year() ).replace( '{month}', date.month() + 1 );
                Fetch( newsApiEndpoint )
                    .then( ( json ) => {
                        if ( Utils.isNullOrUndefined( json.data ) === false ) {
                            News.fetchedJSON = json.data;
                        } else {
                            News.fetchedJSON = json.response.docs;
                        }
                        News.fetchedMonth = ( date.month() + 1 );
                        News.fetching = false;
                        News.set();
                    } );

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