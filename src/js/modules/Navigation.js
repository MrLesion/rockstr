import Utils from './Utils.js';
import Schedule from './Schedule.js';
import Feed from './Feed.js';

/* Templates */
import * as bottomTmp from '../../templates/bottombar.hbs';

const Navigation = {
    construct: () => {
        Navigation.bindings();
        Navigation.buildBottomBar( 'idle' );
        Navigation.shortcuts();
    },
    bindings: () => {
        Utils.eventEmitter.on( 'timeend', ( type, prevType ) => {
            Feed.add('timeend_'+prevType, {type: prevType, manager: });
            Navigation.buildBottomBar( type , false);
        } );
        Utils.eventEmitter.on( 'timepause', ( type ) => {
            Navigation.buildBottomBar( type, false );
        } );
        Utils.eventEmitter.on( 'timestart', ( type ) => {
            Navigation.buildBottomBar( type, true );
        } );
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
    },
    buildBottomBar: ( type, running ) => {
        console.log('Building bottombar, ', type);
        let dataObj = {
            activity: type,
            translationKey: 'activity_'+type,
            running: running
        }
        document.querySelector( '.hbs-container-bottombar' ).innerHTML = bottomTmp( dataObj );
    }
};

export default Navigation;