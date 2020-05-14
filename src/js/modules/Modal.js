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
        let modal = Modal.getSelector();
        modal.setAttribute( 'data-hidden', 'false' );

        if ( typeof fnCallback === 'function' && Utils.isNullOrUndefined( fnCallback ) === false ) {
            fnCallback();
        }

    },
    hide: ( fnCallback ) => {
        let modal = Modal.getSelector();
        modal.setAttribute( 'data-hidden', 'true' );
        modal.innerHTML = '';

        if ( typeof fnCallback === 'function' && Utils.isNullOrUndefined( fnCallback ) === false ) {
            fnCallback();
        }
    },
    getSelector: () => {
        return document.querySelector( '.modal-backdrop' );
    }
}

export default Modal;