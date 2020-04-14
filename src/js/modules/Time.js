import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Bands from './Bands.js';
import Store from './Store.js';
import Dictionary from '../Dictionary.js';
import Charts from './Charts.js';
import Events from './Events.js';
import News from './News.js';
import Protagonist from './Protagonist.js';
import Schedule from './Schedule.js';
import Modal from './Modal.js';

/* Vendor */
import * as moment from 'moment';

/* Templates */
import * as eventModalTmp from '../../templates/eventModal.hbs';


const Time = {
    model: {},
    ticks: 0,
    ticker: null,
    construct: () => {
        Time.model.date = Time.get().date;
        Time.model.daysAlive = Time.get().daysAlive;
        Store.set('time', Time.model);
        Time.update();
    },
    set: (add, callback) => {
        Time.model.date = moment(Store.get('time').date).add(add, 'days');
        Time.model.daysAlive += add;
        Store.set('time', Time.model);
        Time.update();
        if (typeof callback === 'function') {
            return callback(value);
        }
    },
    get: () => {
        let stored = Store.get('time');
        if (Utils.isNullOrUndefined(stored) === true) {
            return {
                date: Settings.STARTDATE,
                daysAlive: 1
            };
        } else {
            return stored;
        }
    },
    run: (days = 0, type = 'laze', timeObj = null) => {

        let activity = Dictionary.get('activity_' + type);

        document.querySelector('.wrapper').classList.add('time-ticking');

        if (Utils.isNullOrUndefined(timeObj) === false) {
            Time.ticks = timeObj.duration;
        } else {
            Time.ticks += days;
        }

        Protagonist.set('activity', activity);


        Time.ticker = setInterval(() => {
            console.log('Time.run', Time.ticks);
            const eventTick = Utils.randInt(20);
            Time.set(1);
            let checkDateForEvent = Schedule.updateDate();
            Time.handleEffects();
            Events.whileDoing(type);

            if (Utils.objectIsEmpty(checkDateForEvent) === false) {
                Time.end();
                Time.runScheduledEvent(checkDateForEvent);
            } else if (Utils.isNullOrUndefined(timeObj) === true && eventTick < 5) {
                Time.pause(eventTick);
                Time.runEvent();

            } else if (Time.ticks < 1) {
                Time.end();
                if (Utils.isNullOrUndefined(timeObj) === false && timeObj.update) {
                    Object.keys(timeObj.update).forEach((key) => {
                        let oldValue = Protagonist.get(key);
                        Protagonist.set(key, oldValue + timeObj.update[key].value);
                    });
                    if (timeObj.callback && typeof timObj.callback === 'function') {
                        timeObj.callback(type);
                    }
                }
            }
            let band = Bands.getBand();
            Time.ticks--;
        }, Settings.TICK);
    },

    end: () => {
        console.log('Time.end');
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.remove('time-ticking');
        Protagonist.set('activity', 'Idle');
        Time.ticks = 0;
        clearInterval(Time.ticker);
    },
    pause: (eventTick) => {
        console.log('Time.pause', eventTick);
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.remove('time-ticking');
        Protagonist.set('activity', 'Idle');
        clearInterval(Time.ticker);
    },
    runEvent: () => {
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
    runScheduledEvent: (scheduledEventObject) => {
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
                    if (allBands[i].genre === Protagonist.get('genre') ) {
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
    },
    handleEffects: () => {
        const wrapper = document.querySelector('.wrapper');
        let addictions = Store.get('addictions') || {};

        Object.keys(addictions).forEach((key) => {
            if (addictions[key].trip > 0) {
                wrapper.classList.add(key + '-trip');
                addictions[key].trip = addictions[key].trip - 1;
            } else {
                wrapper.classList.remove(key + '-trip');
            }

        });

        Store.set('addictions', addictions);
    },
    update: () => {
        let dateElement = document.querySelector('[data-prop="date"]');
        if (Utils.isNullOrUndefined(dateElement) === false) {
            dateElement.innerHTML = moment(Time.model.date).format(Settings.DATEFORMAT);
        }
        if (Time.model.daysAlive > 1 && Time.model.daysAlive % Settings.RENTDUE === 0) {
            Events.emit('rentDue');
        }
        if (Time.model.daysAlive > 1 && Time.model.daysAlive % 7 === 0) {
            Events.emit('ChartsUpdate');
        } else {
            News.get();
        }
    }
}

export default Time;