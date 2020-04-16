import Schedule from './Schedule.js';

const Navigation = {
    construct: () => {
        Navigation.shortcuts();
    },
    bindings: () => {

    },
    shortcuts: () => {
        let hiddenIcons = document.getElementsByClassName( 'hidden-action-icon' );

        for ( var i = 0; i < hiddenIcons.length; i++ ) {
            ( ( x ) => {
                hiddenIcons[ x ].addEventListener( 'click', () => {
                    let parentElement = hiddenIcons[ x ].parentNode;
                    if ( parentElement.classList.value.indexOf( 'show' ) === -1 ) {
                        let hiddenContainers = document.getElementsByClassName( 'hidden-action' );
                        for ( var j = 0; j < hiddenContainers.length; j++ ) {
                            ( ( y ) => {
                                hiddenContainers[ y ].classList.remove( 'show' );
                            } )( j )
                        }
                        parentElement.classList.add( 'show' );
                        if ( parentElement.id === 'calendar' ) {
                            setTimeout( () => {
                                Schedule.render();
                            }, 100 )
                        }
                        parentElement.querySelector( '.hidden-action-container' ).addEventListener( 'click', () => {
                            parentElement.classList.remove( 'show' );
                        } );
                    }
                }, false );
            } )( i );
        }
    }
};

export default Navigation;