import Utils from './Utils.js'

const Modal = {
    construct: () => {
        Modal.bindings();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'modal.show', ( fnCallback ) => {
            Modal.show( fnCallback );
        } );
        Utils.eventEmitter.on( 'modal.hide', ( fnCallback ) => {
            Modal.hide( fnCallback );
        } );
        Utils.delegate( 'click', '.modal-close', () => {
            Utils.eventEmitter.emit( 'modal.hide' );
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
    }
}

export default Modal;