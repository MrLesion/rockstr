import { TPL_EVENT_INTERVIEW_MODAL } from '../Templates.js';

import Utils from './Utils.js';
import Protagonist from './Protagonist.js';
import Bands from './Bands.js';
import Songs from './Songs.js';

const Interview = {
	run: ( scheduledEventObject ) => {
		Object.keys( scheduledEventObject.questions ).forEach( ( questionKey ) => {
			let optionAction = scheduledEventObject.questions[ questionKey ].action;
			let options = scheduledEventObject.questions[ questionKey ].options;
			let editedOptions = options;
			if ( optionAction === 'addSongs' ) {
				let songs = Songs.get();
				for ( var i = 0; i < songs.length; i++ ) {
					editedOptions.push( songs[ i ] );
				}
			} else if ( optionAction === 'addBands' ) {
				let allBands = Bands.getAllBands();
				for ( let i = allBands.length - 1; i >= 0; i-- ) {
					if ( allBands[ i ].genre === Protagonist.get( 'genre' ) ) {
						editedOptions.push( allBands[ i ].name );
					}

				}
			}
		} );
		Interview.build( scheduledEventObject );
	},
	bindings: ( modalContainer ) => {
		let firstQuestion = modalContainer.querySelector( '[data-step="0"]' );
		firstQuestion.classList.add( 'active' );

		let selects = modalContainer.querySelectorAll( 'select' );

		for ( var i = 0; i < selects.length; i++ ) {
			selects[ i ].addEventListener( 'change', ( event ) => {
				let curStep = event.target.closest( '[data-step]' );
				let curStepIndex = parseInt( curStep.dataset.step );
				let nextStep = modalContainer.querySelector( '[data-step="' + ( curStepIndex + 1 ) + '"]' );
				if ( Utils.isNullOrUndefined( nextStep ) === false ) {
					curStep.classList.remove( 'active' );
					nextStep.classList.add( 'active' );
				} else {
					Utils.eventEmitter.emit( 'modal.hide' );
				}
			} );
		}
	},
	build: ( eventObj ) => {
		let modalContainer = document.querySelector( '.modal-backdrop' );
		modalContainer.innerHTML = TPL_EVENT_INTERVIEW_MODAL( eventObj );

		Utils.eventEmitter.emit( 'modal.show', () => {
			Interview.bindings( modalContainer );
		} );
	}
};

export default Interview;