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
    run: () => {
        let eventTypes = ['life', 'promotions', 'drugs']
        let eventType = eventTypes[Utils.randIndex(eventTypes.length)];
        let event = Data[eventType][Utils.randIndex(Data[eventType].length)];
        if (Utils.isNullOrUndefined(event.update) === false) {
            Object.keys(event.update).forEach(function(key) {
                let updatedValue = Protagonist.get(key) + event.update[key].value;
                Protagonist.set(key, updatedValue);
            });
        }

        Events.emit(eventType, event);
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
    schedule: {
        run: (scheduledEventObject) => {
            let modalContainer = document.querySelector('.modal-backdrop');
            Object.keys(scheduledEventObject.questions).forEach((questionKey) => {
                let optionAction = scheduledEventObject.questions[questionKey].action;
                let options = scheduledEventObject.questions[questionKey].options;
                let editedOptions = options;
                if (optionAction === 'addSongs') {
                    editedOptions.push('All songs');
                } else if (optionAction === 'addBands') {
                    let allBands = Bands.getAllBands();
                    for (let i = allBands.length - 1; i >= 0; i--) {
                        if (allBands[i].genre === Protagonist.get('genre')) {
                            editedOptions.push(allBands[i].name);
                        }

                    }
                }
            });
            modalContainer.innerHTML = eventModalTmp(scheduledEventObject);
            Modal.show(() => {
                let firstQuestion = modalContainer.querySelector('[data-step="0"]');
                firstQuestion.classList.add('active');
                Modal.bindEvents();
            });
        }
    },
    whileBusking: () => {
        let randInt = Utils.randInt(5);
        let factor = Utils.intNegPos(randInt);
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
                return Events.whileBusking();
                break;
            default:
                // statements_def
                break;
        }
    }
}

export default Events;