import { TPL_FEED_PANEL } from '../Templates.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Time from './Time.js';
import Events from './Events.js';
import Protagonist from './Protagonist.js';
import Speech from './Speech.js';

/* Vendor */
import * as moment from 'moment';

const Feed = {
    store: [],
    add: ( key, replaceObj ) => {
        let time = Time.get().date;
        Feed.store.unshift( { key: key, replaceObj: replaceObj, date: moment( time ).format( Settings.DATE_FORMAT ) } );
        Feed.build();
    },
    bindAction: ( container, eventObj ) => {
        var confirmAction = container.querySelector( '.feed-event-action-yes' ),
            cancelAction = container.querySelector( '.feed-event-action-no' ),
            action = container.querySelector( '.feed-event-action' );
        if ( action ) {
            confirmAction.addEventListener( 'click', () => {
                let consequence = eventObj.consequence;
                if ( consequence === 'drug' ) {
                    Protagonist.doDrugs( eventObj );
                } else if ( consequence === 'promotion' ) {
                    Protagonist.doPromotion( eventObj );
                } else if ( consequence === 'changeTitle' ) {
                    Events.studio.acceptNewTitle();
                }
                action.parentNode.removeChild( action );
            } );
            cancelAction.addEventListener( 'click', () => {
                action.parentNode.removeChild( action );
            } );
        }

    },
    event: ( eventObj ) => {
        let time = Time.get().date;
        Feed.store.unshift( { event: eventObj, date: moment( time ).format( Settings.DATE_FORMAT ) } );
        Feed.build( eventObj );
    },
    build: ( eventObj ) => {
        const container = document.querySelector( '.hbs-container-feed' );
        container.innerHTML = TPL_FEED_PANEL( Feed.store );
        if ( Utils.isNullOrUndefined( eventObj ) === false ) {
            Feed.bindAction( container, eventObj );
        }
        let lastEntry = container.querySelector( '.feed-text-to-speech' ).innerText;
        Speech.speak( lastEntry )

    }
}

export default Feed;