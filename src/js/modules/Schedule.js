import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Store from './Store.js';
import Time from './Time.js';
import Feed from './Feed.js';

/* Vendor */
import * as moment from 'moment';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';


const Schedule = {
    calendar: null,
    month: 0,
    store: {},
    construct: () => {
        let calendarElement = document.getElementById('calendar-container');
        let time = Store.get('time') !== null ? Store.get('time').date : Settings.STARTDATE;

        let events = Store.get('schedule');

        Schedule.calendar = new Calendar(calendarElement, {
            plugins: [dayGridPlugin],
            header: {
                left: 'title',
                center: '',
                right: ''
            },
            defaultDate: moment(time).format('YYYY-MM-DD'),
            now: moment(time).format('YYYY-MM-DD'),
            events: []
        });
        Schedule.month = moment(time).month();

        if (Utils.isNullOrUndefined(events) === false) {
            Object.keys(events).forEach((eventKey) => {
                let event = {
                    title: events[eventKey].schedule.title,
                    start: moment(eventKey).format('YYYY-MM-DD'),
                    extendedProps: events[eventKey]
                };
                Schedule.calendar.addEvent(event);
            });
        }


    },
    register: (eventObj, eventDate) => {
        if (eventObj && eventDate) {
            let event = {
                title: eventObj.schedule.title,
                start: eventDate.format('YYYY-MM-DD'),
                extendedProps: eventObj
            };
            Schedule.calendar.addEvent(event);
            Schedule.store[eventDate.format('YYYY-MM-DD')] = eventObj;
            Store.set('schedule', Schedule.store);
        }

    },
    get: () => {

    },
    set: () => {

    },
    hasEvent: () => {
        let time = Utils.isNullOrUndefined(Store.get('time')) === false ? Store.get('time').date : Settings.STARTDATE;
        let returnEvent = {};

        if (Schedule.store[moment(time).format('YYYY-MM-DD')]) {
            returnEvent = Schedule.store[moment(time).format('YYYY-MM-DD')];
        }

        return returnEvent;
    },
    updateDate: () => {
        let scheduledEvent = {};
        if (Utils.isNullOrUndefined(Schedule.calendar) === false) {
            let time = Utils.isNullOrUndefined(Store.get('time')) === false ? Store.get('time').date : Settings.STARTDATE;
            Schedule.calendar.setOption('now', moment(time).format('YYYY-MM-DD'));

            scheduledEvent = Schedule.hasEvent();

            if (Schedule.month !== moment(time).month()) {
                Schedule.month = moment(time).month();
                Schedule.calendar.next();
            }
        }
        return scheduledEvent;

    },
    render: () => {
        Schedule.calendar.render();
    }
}

export default Schedule;