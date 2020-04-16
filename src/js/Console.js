import Utils from './modules/Utils.js';

const Console = {
    debug: true,
    log: ( key, obj = {}, type = 'log' ) => {
        if ( Console.debug === true ) {
            if ( Utils.isNullOrUndefined( Console.loggings[ key ] ) === true ) {
                console[ type ]( key, obj );

            } else {
                console[ type ]( Console.loggings[ key ], obj );
            }
        }

    },
    loggings: {
        chartsConstruct: 'Charts being constructed',
        chartsGet: 'Getting chart data',
        chartsUpdateEntry: 'Updated chart entry',
        chartsUpdate: 'Updating charts'
    }

};

export default Console;