import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Time from './Time.js';
import Feed from './Feed.js';
import Protagonist from './Protagonist.js';
import Charts from './Charts.js';
import Schedule from './Schedule.js';

/* Vendor */
import * as moment from 'moment';


const Events = {
    current: {},
    next: {},
    emit: (key, value) => {
        if (Utils.isNullOrUndefined(Events[key]) === false) {
            Events.current = value;
            Events[key](value);
        }
    },
    rentDue: (value) => {
        Feed.add('eventRentDue', { rent: Settings.RENT });
        Protagonist.set('money', (Protagonist.get('money') - Settings.RENT));
    },
    ChartsUpdate: (value) => {
        Feed.add('eventChartsUpdated');
        Charts.update();
    },
    promotions: (value) => {
        Feed.event(value);
        Schedule.register(value);
        console.log('event - promotions', value);
    },
    drugs: (value) => {
        Feed.event(value);
        console.log('event - drugs', value);
    },
    life: (value) => {
        Feed.event(value);
        console.log('event - life', value);
    },
    whileBusking: () => {
        let factor = Utils.randInt(5);
        let fame = Protagonist.get('fame');
        fame = Math.floor(fame + factor);
        Protagonist.set('fame', fame);
        let money = Protagonist.get('money');
        money = Math.floor(money + factor);
        Protagonist.set('money', money);
    },
    whileDoing: (type) => {
        switch (type) {
            case 'busk':
                //return Events.whileBusking();
                break;
            default:
                // statements_def
                break;
        }
    }
}

export default Events;