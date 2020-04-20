import Utils from './Utils.js';
import Time from './Time.js';
import Temp from './Temp.js';
import Songs from './Songs.js';

const Modal = {
    construct: () => {
        Modal.bindings();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'modal.show', ( fnCallback ) => {
            Modal.show( fnCallback );
        } );
        Utils.eventEmitter.on( 'modal.hide', () => {
            Modal.hide();
        } );
    },
    show: ( fnCallback ) => {
        let modal = document.querySelector( '.modal-backdrop' );
        modal.setAttribute( 'data-hidden', 'false' );

        if ( typeof fnCallback === 'function' && Utils.isNullOrUndefined( fnCallback ) === false ) {
            fnCallback();
        }

    },
    hide: ( fnCallback ) => {
        let modal = document.querySelector( '.modal-backdrop' );
        modal.setAttribute( 'data-hidden', 'true' );
        modal.innerHTML = '';

        if ( typeof fnCallback === 'function' && Utils.isNullOrUndefined( fnCallback ) === false ) {
            fnCallback();
        }
    },
    bindEvents: ( type ) => {
        let modal = document.querySelector( '.modal-backdrop' );
        if ( type === 'step' ) {
            let selects = modal.querySelectorAll( 'select' );
            for ( var i = 0; i < selects.length; i++ ) {
                selects[ i ].addEventListener( 'change', ( event ) => {
                    let curStep = event.target.closest( '[data-step]' );
                    let curStepIndex = parseInt( curStep.dataset.step );
                    let nextStep = modal.querySelector( '[data-step="' + ( curStepIndex + 1 ) + '"]' );
                    if ( Utils.isNullOrUndefined( nextStep ) === false ) {
                        curStep.classList.remove( 'active' );
                        nextStep.classList.add( 'active' );
                    } else {
                        Utils.eventEmitter.emit( 'modal.hide' );
                    }
                } );
            }
        } else if ( type === 'studio' ) {
            let generateSongTitle = modal.querySelector( '.generate-song-title' );
            let saveSongTitle = modal.querySelector( '.save-song-title' );
            let songTitleInput = modal.querySelector( '#SongTitle' );

            generateSongTitle.addEventListener( 'click', () => {
                Temp.recording.song = Songs.generate();
                songTitleInput.value = Temp.recording.song.song;
            } );

            saveSongTitle.addEventListener( 'click', () => {
                Temp.recording.song = Songs.generate( songTitleInput.value );
                let days = Utils.randInt( 10 );

                Utils.eventEmitter.emit( 'modal.hide' );
                Time.run( days, 'record' );
            } );

        }

    }
}

export default Modal;