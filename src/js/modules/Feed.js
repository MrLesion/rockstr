import Settings from '../Settings.js';
import Utils from './Utils.js';
import Time from './Time.js';
import Protagonist from './Protagonist.js';

/* Vendor */
import * as moment from 'moment';

/* Templates */
import * as feedTmp from '../../templates/feed.hbs';

const Feed = {
    store: [],
    add: (key, replaceObj) => {
        let time = Time.get().date;
        Feed.store.unshift({ key: key, replaceObj: replaceObj, date: moment(time).format(Settings.DATEFORMAT) });
        Feed.build();
    },
    bindAction: (container, eventObj) => {
        var confirmAction = container.querySelector('.feed-event-action-yes'),
            cancelAction = container.querySelector('.feed-event-action-no'),
            action = container.querySelector('.feed-event-action');
        if (action) {
            confirmAction.addEventListener('click', () => {
                let consequence = eventObj.consequence;
                if (consequence === 'drug') {
                    Protagonist.doDrugs(eventObj);
                    action.parentNode.removeChild(action);
                } else if (consequence === 'promotion') {
                    Protagonist.doPromotion(eventObj);
                    action.parentNode.removeChild(action);
                }
            });
            cancelAction.addEventListener('click', () => {
                action.parentNode.removeChild(action);
            });
        }

    },
    event: (eventObj) => {
        let time = Time.get().date;
        Feed.store.unshift({ event: eventObj, date: moment(time).format(Settings.DATEFORMAT) });
        Feed.build(eventObj);
    },
    build: (eventObj) => {
        const container = document.querySelector('.hbs-container-feed');
        container.innerHTML = feedTmp(Feed.store);
        if (Utils.isNullOrUndefined(eventObj) === false) {
            Feed.bindAction(container, eventObj);
        }

    }
}

export default Feed;