import * as Data from './Data.js';

import { TPL_TOUR } from '../Templates.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Store from './Store.js';
import Models from '../Models.js';
import Protagonist from './Protagonist.js';
import Time from './Time.js';
import Schedule from './Schedule.js';
import Feed from './Feed.js';

/* Vendor */
import * as moment from 'moment';

const Tour = {
	results: [],
	model: {},
	run: () => {
		Object.assign( Tour.model, Models.tour() );
		Object.assign( Tour.results, {} );
		let venues = Object.assign( {}, Data.core.tour.venue );
		let scales = Object.assign( {}, Data.core.tour.scale );
		let time = Object.assign( {}, Data.core.tour.time );

		let dataObj = {
			venues: venues,
			scales: scales,
			time: time,
			isGig: false
		};

		Tour.build( dataObj );
	},
	build: ( dataObj ) => {
		let modalContainer = document.querySelector( '.modal-backdrop' );
		modalContainer.innerHTML = TPL_TOUR( dataObj );
		Utils.eventEmitter.emit( 'modal.show', () => {
			if ( dataObj.isGig === true ) {
				Tour.gig.bindings( modalContainer );
			} else {
				Tour.bindings( modalContainer );
				Tour.update();
			}

		} );
	},
	bindings: ( modalContainer ) => {
		let generateTourName = modalContainer.querySelector( '.generate-tour-name' );
		let saveTour = modalContainer.querySelector( '.save-tour' );
		let tourName = modalContainer.querySelector( '#TourName' );
		let selects = modalContainer.querySelectorAll( '.tour-select' );

		for ( var i = 0; i < selects.length; i++ ) {
			( ( x ) => {
				selects[ x ].addEventListener( 'change', () => {
					Tour.update();
				}, false );
			} )( i );
		}

		generateTourName.addEventListener( 'click', () => {
			Tour.model.name = Tour.generateName();
			tourName.value = Tour.model.name;
		} );

		saveTour.addEventListener( 'click', () => {
			Tour.model.name = Tour.model.name || Tour.generateName();
			Utils.eventEmitter.emit( 'modal.hide' );
			Tour.register();
		} );
	},
	update: () => {
		let costElement = document.querySelector( '.tour-cost' );
		let timeElement = document.querySelector( '.tour-time' );
		let venue = document.getElementById( 'venueSelect' );
		let scale = document.getElementById( 'scaleSelect' );
		let time = document.getElementById( 'timeSelect' );
		Tour.model.cost = 0;
		Tour.model.venue = venue.value;
		Tour.model.scale = scale.value;
		Tour.model.time = time.value;

		if ( venue.value !== '' ) {
			Tour.model.cost += parseInt( Data.core.tour.venue[ venue.value ].cost * ( time.value * 7 ) );
		}
		if ( scale.value !== '' ) {
			Tour.model.cost += Data.core.tour.scale[ scale.value ].cost;
		}
		if ( time.value !== '' ) {
			Tour.model.time = ( time.value * 7 );
		}
		timeElement.innerText = Tour.model.time;
		costElement.innerText = Tour.model.cost;
		Tour.setSelectableOptions();
	},
	setSelectableOptions: () => {
		let venue = document.getElementById( 'venueSelect' );
		let scale = document.getElementById( 'scaleSelect' );
		let time = document.getElementById( 'timeSelect' );

		let venueOptions = venue.getElementsByTagName( 'option' );
		let scaleOptions = scale.getElementsByTagName( 'option' );

		let rentFactor = Math.ceil( Settings.RENT_AMOUNT * ( Settings.RENT_DUE_INTERVAL % Tour.model.time ) );

		for ( let i = 0; i < venueOptions.length; i++ ) {
			if ( time.value === '' ) {
				venueOptions[ i ].disabled = true;
			} else if ( venueOptions[ i ].value !== '' ) {
				let values = venueOptions[ i ].dataset;
				if ( ( ( parseInt( values.cost ) * Tour.model.time ) + Tour.model.cost ) > ( Protagonist.get( 'money' ) - rentFactor ) ) {
					venueOptions[ i ].disabled = true;
				} else {
					venueOptions[ i ].disabled = false;
				}
			}
		}
		for ( let i = 0; i < scaleOptions.length; i++ ) {
			if ( time.value === '' ) {
				scaleOptions[ i ].disabled = true;

			} else if ( scaleOptions[ i ].value !== '' ) {
				let values = scaleOptions[ i ].dataset;
				if ( ( parseInt( values.cost ) + Tour.model.cost ) > ( Protagonist.get( 'money' ) - rentFactor ) ) {
					scaleOptions[ i ].disabled = true;
				} else {
					scaleOptions[ i ].disabled = false;
				}
			}

		}
	},
	register: () => {
		let time = Time.today();
		let randEventDays = Utils.randInt( 14 );
		let eventDate = moment( time ).add( randEventDays, 'days' );
		let manager = Utils.getNpc( 'manager' );
		for ( var i = 0; i < Tour.model.time; i++ ) {
			( ( x ) => {
				let eventObj = Object.assign( {}, Models.event );
				eventObj.title = Tour.model.name + ' day ' + ( x + 1 );
				eventObj.start = moment( eventDate ).add( x, 'days' );
				eventObj.extendedProps = { type: 'tourDate', venue: Tour.model.venue, scale: Tour.model.scale, time: Tour.model.time, day: ( x + 1 ) };
				Schedule.register( eventObj );
			} )( i )
		}

		Store.add( 'tours', {
			tourname: Tour.model.name,
			start: eventDate,
			end: moment( eventDate ).add( ( Tour.model.time - 1 ), 'days' ),
			result: 'not started yet'
		} );
		Feed.add( 'tour_register', { manager: manager, time: randEventDays, tourname: Tour.model.name } );
	},
	generateName: () => {
		return 'The ' + Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ] + ' Tour';
	},
	gig: {
		run: ( eventObj ) => {
			let venues = Object.assign( {}, Data.core.tour.venue );
			let scales = Object.assign( {}, Data.core.tour.scale );

			let dataObj = {
				title: eventObj.title,
				venue: venues[ eventObj.extendedProps.venue ].label,
				scale: scales[ eventObj.extendedProps.scale ].label,
				day: eventObj.extendedProps.day,
				isGig: true,
				feedback: 0
			};
			dataObj.feedback = Tour.gig.getFeedback( dataObj )
			Tour.build( dataObj );
		},
		bindings: ( modalContainer ) => {
			let endGigButton = modalContainer.querySelector( '.end-gig' );
			endGigButton.addEventListener( 'click', () => {
				Utils.eventEmitter.emit( 'modal.hide' );
				Time.run( 1, 'tour' );
			} );
		},
		getFeedback: ( dataObj ) => {
			let prevFeedback = dataObj.day > 1 ? Tour.results[ ( dataObj.day - 1 ) ] : 0;

			if ( prevFeedback > 0 ) {
				console.log( dataObj.day + ' day' );
				return 1;
			} else {
				console.log( 'first day' );
				return 0;
			}
		}
	}
};

export default Tour;