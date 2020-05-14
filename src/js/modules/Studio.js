import { TPL_STUDIO } from '../Templates.js';

import * as Data from './Data.js';

import Settings from '../Settings.js';
import Models from '../Models.js';
import Utils from './Utils.js';
import Modal from './Modal.js';
import Feed from './Feed.js';
import Protagonist from './Protagonist.js';
import Songs from './Songs.js';
import Time from './Time.js';
import Achievements from './Achievements.js';

const Studio = {
	model: {},
	run: () => {
		Object.assign( Studio.model, Models.studio() );
		Studio.model.days = Utils.randInt( Settings.EVENTS_STUDIO_DAYS_INTERVAL );
		let studios = Object.assign( {}, Data.core.record.studios );
		let producers = Object.assign( {}, Data.core.record.producers );

		let dataObj = {
			studios: studios,
			producers: producers,
			days: Studio.model.days
		};


		Studio.build( dataObj );
	},
	build: ( dataObj ) => {
		let modalContainer = Modal.getSelector();
		modalContainer.innerHTML = TPL_STUDIO( dataObj );
		Utils.eventEmitter.emit( 'modal.show', () => {
			Studio.bindings( modalContainer );
			Studio.update();
		} );
	},
	bindings: ( modalContainer ) => {
		let generateSongTitle = modalContainer.querySelector( '.generate-song-title' );
		let saveSongTitle = modalContainer.querySelector( '.save-song-title' );
		let songTitleInput = modalContainer.querySelector( '#SongTitle' );
		let selects = modalContainer.querySelectorAll( '.recording-select' );

		for ( var i = 0; i < selects.length; i++ ) {
			( ( x ) => {
				selects[ x ].addEventListener( 'change', () => {
					Studio.update();
				}, false );
			} )( i );
		}

		generateSongTitle.addEventListener( 'click', () => {
			Studio.model.song = Songs.generateTitle();
			songTitleInput.value = Studio.model.song;
		} );

		saveSongTitle.addEventListener( 'click', () => {
			Studio.model.song = Studio.model.song || Songs.generateTitle();
			Utils.eventEmitter.emit( 'modal.hide' );

			Time.run( Studio.model.days, 'record' );
		} );
	},
	update: () => {
		let costElement = document.querySelector( '.studio-cost' );
		let studio = document.getElementById( 'studioSelect' );
		let producer = document.getElementById( 'producerSelect' );
		Studio.model.cost = 0;
		Studio.model.quality = 0;

		if ( studio.value !== '' ) {
			Studio.model.cost += parseInt( Data.core.record.studios[ studio.value ].cost * Studio.model.days );
			Studio.model.quality += parseInt( Data.core.record.studios[ studio.value ].quality );
		}
		if ( producer.value !== '' ) {
			Studio.model.cost += Data.core.record.producers[ producer.value ].cost;
			Studio.model.quality += Data.core.record.producers[ producer.value ].quality;
		}
		costElement.innerText = Studio.model.cost;
		Studio.setSelectableOptions();

	},
	setSelectableOptions: () => {
		let studio = document.getElementById( 'studioSelect' );
		let producer = document.getElementById( 'producerSelect' );
		let studioOptions = studio.getElementsByTagName( 'option' );
		let producerOptions = producer.getElementsByTagName( 'option' );
		let rentFactor = Math.ceil( Settings.RENT_AMOUNT * ( Settings.RENT_DUE_INTERVAL % Studio.model.days ) );

		for ( let i = 0; i < studioOptions.length; i++ ) {
			if ( studioOptions[ i ].value !== '' ) {
				let values = studioOptions[ i ].dataset;
				if ( ( ( parseInt( values.cost ) * Studio.model.days ) + Studio.model.cost ) > ( Protagonist.get( 'money' ) - rentFactor ) ) {
					studioOptions[ i ].disabled = true;
				} else {
					studioOptions[ i ].disabled = false;
				}
			}

		}
		for ( let i = 0; i < producerOptions.length; i++ ) {
			if ( producerOptions[ i ].value !== '' ) {
				let values = producerOptions[ i ].dataset;
				if ( ( parseInt( values.cost ) + Studio.model.cost ) > ( Protagonist.get( 'money' ) - rentFactor ) ) {
					producerOptions[ i ].disabled = true;
				} else {
					producerOptions[ i ].disabled = false;
				}
			}

		}
	},
	getNewTitle: () => {
		let newSongTitle = Songs.generateTitle();
		Studio.model.temp = newSongTitle;
		return newSongTitle;
	},
	acceptNewTitle: () => {
		Studio.model.song = Studio.model.temp;
		Studio.model.temp = '';
	},
	releaseSong: () => {
		let song = Songs.generate( Studio.model.song, Studio.model.quality, true );
		let cost = Studio.model.cost;
		Studio.reset();
		Protagonist.set( 'money', -cost, true );
		let songs = Songs.get();
		Achievements.set( 'firstSong' );
		songs.push( song );
		Songs.set( songs );

		Feed.add( 'event_studio_release', { song: song.song, cost: cost } );
	},
	reset: () => {
		Studio.model.song = '';
		Studio.model.temp = '';
		Studio.model.days = 0;
		Studio.model.cost = 0;
		Studio.model.quality = 0;
	}
};

export default Studio;