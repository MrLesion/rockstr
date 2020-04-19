import Utils from './Utils.js';

const Modal = {
    construct: () => {
        Modal.construct();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'modalShow', () => {
            Modal.show();
        } );
        Utils.eventEmitter.on( 'modalHide', () => {
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
    hide: () => {
        let modal = document.querySelector( '.modal-backdrop' );
        modal.setAttribute( 'data-hidden', 'true' );
        modal.innerHTML = '';
    },
    bindEvents: () => {
        let modal = document.querySelector( '.modal-backdrop' );
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
                    alert( 'done' )
                }
            } );
        }
    }
}

export default Modal;