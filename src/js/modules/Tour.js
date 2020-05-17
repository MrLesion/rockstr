import * as Data from './Data.js';

import { TPL_TOUR } from '../Templates.js';

import Constants from '../Constants.js';
import Utils from './Utils.js';
import Modal from './Modal.js';
import Store from './Store.js';
import Models from '../Models.js';
import Protagonist from './Protagonist.js';
import Time from './Time.js';
import Schedule from './Schedule.js';
import Feed from './Feed.js';
import Audio from './Audio.js';
import Animations from './Animations.js';

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
		let modalContainer = Modal.getSelector();
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

		let rentFactor = Math.ceil( Constants.RENT_AMOUNT * ( Constants.RENT_DUE_INTERVAL % Tour.model.time ) );

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
		Object.assign( Models.gig, Tour.gig.model );
		Feed.add( 'tour_register', { manager: manager, time: randEventDays, tourname: Tour.model.name } );
	},
	generateName: () => {
		return 'The ' + Data.words.noun[ Utils.randIndex( Data.words.noun.length ) ] + ' Tour';
	},
	gig: {
		model: {},
		run: ( eventObj ) => {
			let venues = Object.assign( {}, Data.core.tour.venue );
			let scales = Object.assign( {}, Data.core.tour.scale );

			let dataObj = {
				title: eventObj.title,
				venue: venues[ eventObj.extendedProps.venue ].label,
				scale: scales[ eventObj.extendedProps.scale ].label,
				attendees: venues[ eventObj.extendedProps.venue ].level,
				level: scales[ eventObj.extendedProps.scale ].level,
				day: eventObj.extendedProps.day,
				isGig: true,
				feedback: 0,
				skill: Constants.TOUR_GIG_GRID
			};
			dataObj.feedback = Tour.gig.getFeedback( dataObj );
			console.log(dataObj);
			Tour.build( dataObj );
		},
		bindings: ( modalContainer ) => {
			let endGigButton = modalContainer.querySelector( '.end-gig' );
			let blocks = modalContainer.getElementsByClassName( 'gig-game-block' );
			let readySpot = modalContainer.querySelector( '.gig-game-ready' );
			let audience = document.querySelector( '.gig-audience' );

			endGigButton.addEventListener( 'click', () => {
				Utils.eventEmitter.emit( 'modal.hide' );
				Time.run( 1, 'tour' );
			} );
			for ( var i = 0; i < blocks.length; i++ ) {
				( ( x ) => {
					blocks[ x ].addEventListener( 'click', Tour.gig.blockListener, false );
				} )( i );
			}
			Tour.gig.model.points = 0;
			Tour.gig.model.rounds = 10;
			audience.style.height = Constants.TOUR_GIG_AUDIENCE + 'px';

			readySpot.addEventListener( 'click', Tour.gig.onStage, false );


		},
		blockListener: ( event ) => {
			if ( event.target.classList.value.indexOf( 'active' ) > -1 ) {
				Tour.gig.stop( event.target );
			}
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
		},
		getAudienceHeight: () => {
			let audience = document.querySelector( '.gig-audience' );
			return audience.clientHeight;
		},
		hasActiveChord: () => {
			let modalContainer = Modal.getSelector();
			let blocks = modalContainer.getElementsByClassName( 'gig-game-block' );

			return Object.values( blocks ).filter( b => b.classList.value.indexOf( 'active' ) > -1 ).length > 0
		},
		audience: () => {
			let audience = document.querySelector( '.gig-audience' );
			Tour.gig.model.audience = setInterval( () => {
				audience.style.height = Tour.gig.getAudienceHeight() - 1 + 'px';
			}, Constants.TOUR_GIG_SPEED );
		},
		onStage: () => {
			Tour.gig.audience();
			Tour.gig.play();
		},
		play: () => {
			Animations.tour.gig.readyState();
			if ( Tour.gig.hasActiveChord() === false ) {
				let blocks = document.getElementsByClassName( 'gig-game-block' );
				let target = Utils.randIndex( blocks.length );
				blocks[ target ].classList.add( 'active' );

				Tour.gig.model.start = new Date().getTime();
				Tour.gig.model.interval = setInterval( () => {
					Tour.gig.model.timer = new Date().getTime();
				}, 1 );

				Tour.gig.model.skillTimer = setTimeout( () => {
					Tour.gig.skip( blocks[ target ] );
				}, ( 500 * Utils.randInt( 10 ) ) );

			}

		},
		skip: ( block ) => {
			block.classList.remove( 'active' );
			Tour.gig.play( false );
		},
		stop: ( block ) => {
			let audience = document.querySelector( '.gig-audience' );
			Animations.tour.gig.hitState();
			clearTimeout( Tour.gig.model.skillTimer );
			clearInterval( Tour.gig.model.interval );
			Audio.play();
			block.classList.remove( 'active' );
			Tour.gig.model.result = ( Tour.gig.model.timer - Tour.gig.model.start ) + Tour.gig.model.start;
			Tour.gig.model.rounds--;
			let milliseconds = Math.floor( ( Tour.gig.model.result % ( 1000 * 60 ) ) / 100 );
			Tour.gig.model.points += milliseconds;
			audience.style.height = Math.ceil( Tour.gig.getAudienceHeight() + milliseconds / Constants.TOUR_GIG_SKILL ) + 'px';
			if ( Tour.gig.model.rounds === 0 ) {
				Tour.gig.end();
			} else {
				Tour.gig.timeout = setTimeout( () => {
					Tour.gig.play();
				}, ( 100 * Utils.randInt( 10 ) ) );
			}

		},
		end: () => {
			clearTimeout( Tour.gig.timeout );
			clearInterval( Tour.gig.model.audience );
			let modalContainer = Modal.getSelector();
			let blocks = modalContainer.getElementsByClassName( 'gig-game-block' );
			let readySpot = modalContainer.querySelector( '.gig-game-ready' );
			let finalScore = Math.floor( Tour.gig.getAudienceHeight() * ( 100 / Constants.TOUR_GIG_AUDIENCE ) );
			readySpot.removeEventListener( 'click', Tour.gig.onStage, false );
			for ( var i = 0; i < blocks.length; i++ ) {
				( ( x ) => {
					blocks[ x ].removeEventListener( 'click', Tour.gig.blockListener, false );
				} )( i );
			}

			if ( finalScore > 50 ) {
				if ( finalScore > 70 ) {
					console.log( '3 ENCORES' );
				} else {
					console.log( 'The crowd was wild' );
				}
			} else {
				if ( finalScore < 30 ) {
					console.log( 'Booed off' );
				} else {
					console.log( 'You get an applaud or two' );
				}
			}
		}
	}
};

export default Tour;