import Settings from '../Settings.js';
import Utils from './Utils.js';
import Store from './Store.js';
import Time from './Time.js';

import Battle from './Battle.js';
import Interview from './Interview.js';
import Tour from './Tour.js';

/* Vendor */
import * as moment from 'moment';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';


const Schedule = {
    calendar: null,
    month: 0,
    model: {},
    construct: () => {
        let calendarElement = document.getElementById( 'calendar-container' );
        let time = Time.today();

        let events = Store.get( 'schedule' );

        Schedule.calendar = new Calendar( calendarElement, {
            plugins: [ dayGridPlugin ],
            header: {
                left: 'title',
                center: '',
                right: ''
            },
            defaultDate: moment( time ).format( Settings.SCHEDULE_DATE_FORMAT ),
            now: moment( time ).format( Settings.SCHEDULE_DATE_FORMAT ),
            events: []
        } );
        Schedule.month = moment( time ).month();

        if ( Utils.isNullOrUndefined( events ) === false ) {
            Utils.each( events, ( prop, value ) => {
                let event = {
                    title: value.title || value.schedule.title,
                    start: moment( prop ).format( Settings.SCHEDULE_DATE_FORMAT ),
                    extendedProps: value
                };
                Schedule.calendar.addEvent( event );
            } );
        }
    },
    register: ( eventObj ) => {
        if ( Utils.isNullOrUndefined( eventObj ) === false ) {
            let event = {
                title: eventObj.title || eventObj.schedule.title,
                start: moment( eventObj.start ).format( Settings.SCHEDULE_DATE_FORMAT ),
                //end: eventObj.end ? eventObj.end.format( Settings.SCHEDULE_DATE_FORMAT ) : '',
                extendedProps: eventObj
            };
            Schedule.calendar.addEvent( event );
            let storedEvents = Object.assign( {}, Store.get( 'schedule' ) );
            storedEvents[ moment( eventObj.start ).format( Settings.SCHEDULE_DATE_FORMAT ) ] = eventObj;
            Store.set( 'schedule', storedEvents );
        }
    },
    hasEvent: () => {
        let time = Time.today();
        let returnEvent = {};
        let storedEvents = Object.assign( {}, Store.get( 'schedule' ) );

        if ( storedEvents[ moment( time ).format( Settings.SCHEDULE_DATE_FORMAT ) ] ) {
            returnEvent = storedEvents[ moment( time ).format( Settings.SCHEDULE_DATE_FORMAT ) ];
        }
        return returnEvent;
    },
    updateDate: () => {
        let scheduledEvent = {};
        if ( Utils.isNullOrUndefined( Schedule.calendar ) === false ) {
            let time = Time.today();
            Schedule.calendar.setOption( 'now', moment( time ).format( Settings.SCHEDULE_DATE_FORMAT ) );

            scheduledEvent = Schedule.hasEvent();

            if ( Schedule.month !== moment( time ).month() ) {
                Schedule.month = moment( time ).month();
                Schedule.calendar.next();
            }
        }
        return scheduledEvent;
    },
    render: () => {
        Schedule.calendar.render();
    },
    run: ( eventObj ) => {
        console.log( 'Scheduled Event', eventObj.extendedProps.type );
        if ( eventObj.extendedProps.type === 'battle' ) {
            Battle.run();
        } else if ( eventObj.extendedProps.type === 'interview' ) {
            Interview.run( eventObj );
        } else if ( eventObj.extendedProps.type === 'tourDate' ) {
            console.log(eventObj);
            Tour.gig.run( eventObj );
        }
    }
}

export default Schedule;