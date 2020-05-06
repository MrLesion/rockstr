import * as Data from './Data.js';

import { TPL_EVENT_INTERVIEW_MODAL } from '../Templates.js';

import Settings from '../Settings.js';
import Feed from './Feed.js';
import Utils from './Utils.js';
import Protagonist from './Protagonist.js';

const Interview = {
	model: {},
	run: () => {
		let interviewOptionsArr = Utils.shuffleArr( Data.interview );
		let interviewModel = {
			questions: [],
			score: 0,
			steps: {
				current: {
					index: 0
				}
			}
		};
		for ( let i = 0; i < 5; i++ ) {
			let questionModel = {};
			let question = interviewOptionsArr[ i ].question;
			let options = interviewOptionsArr[ i ].options;
			questionModel.question = question;
			questionModel.options = [];
			for ( let o = 0; o < options.length; o++ ) {
				questionModel.options.push( {
					text: options[ o ],
					value: Utils.randInt( Settings.INTERVIEW_INDEX_SCORE )
				} );
			}
			interviewModel.questions.push( questionModel );
		}
		Object.assign( Interview.model, interviewModel );
		Interview.build( Interview.model );

	},
	bindings: ( modalContainer ) => {
		let selects = modalContainer.querySelectorAll( 'select' );

		for ( var i = 0; i < selects.length; i++ ) {
			selects[ i ].addEventListener( 'change', ( event ) => {
				let index = event.target.selectedIndex;
				Interview.model.score += parseInt( event.target.value );
				Interview.answer( event.target.value, event.target[ index ].text );

			} );
		}
	},
	answer: ( score, text ) => {
		let medio = Settings.INTERVIEW_INDEX_SCORE / 2;
		let answerText = '';
		if ( score > medio ) {
			answerText = 'Alright - well done!';
		} else if ( score < medio ) {
			answerText = 'Are you kidding me?!';
		} else {
			answerText = 'Okayz..';
		}
		Interview.model.questions[ Interview.model.steps.current.index ].response = answerText;
		Interview.model.questions[ Interview.model.steps.current.index ].answer = text;
		Interview.model.steps.current.index++;
		if ( Utils.isNullOrUndefined( Interview.model.questions[ Interview.model.steps.current.index ] ) === false ) {
			Interview.build( Interview.model );
		} else {
			Interview.calculateScore();
		}
	},
	calculateScore: () => {
		let medio = Settings.INTERVIEW_MAX_SCORE / 2;
		let scoreText = '';
		let updateObj = {
			fame: 0,
			happiness: 0,
			mentality: 0
		};
		if ( Interview.model.score > medio ) {
			scoreText = 'very well';
			updateObj.fame = Utils.randInt( Interview.model.score );
			updateObj.happiness = Utils.randInt( Interview.model.score );
			updateObj.mentality = Utils.randInt( Interview.model.score );
		} else if ( Interview.model.score < medio ) {
			scoreText = 'pretty shitty';
			updateObj.fame = -Utils.randInt( Interview.model.score );
			updateObj.happiness = -Utils.randInt( Interview.model.score );
			updateObj.mentality = -Utils.randInt( Interview.model.score );
		} else {
			scoreText = '..meh';
			updateObj.fame = Utils.randInt( Interview.model.score / 2 );
			updateObj.happiness = Utils.randInt( Interview.model.score / 2 );
			updateObj.mentality = Utils.randInt( Interview.model.score / 2 );
		}
		Utils.each( updateObj, ( prop, value ) => {
			Protagonist.set( prop, value, true );
		} );
		Feed.add( 'event_interview_done', { scoretext: scoreText } );
		Utils.eventEmitter.emit( 'modal.hide');
	},
	build: ( eventObj ) => {
		let modalContainer = document.querySelector( '.modal-backdrop' );
		modalContainer.innerHTML = TPL_EVENT_INTERVIEW_MODAL( eventObj );

		Utils.eventEmitter.emit( 'modal.show', () => {
			Interview.bindings( modalContainer );
		} );
	},
	reset: () => {
		Object.assign( Interview.model, {} );
	}
};

export default Interview;