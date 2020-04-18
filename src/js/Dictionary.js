import Utils from './modules/Utils.js';

const Dictionary = {
    get: ( key ) => {
        if ( Utils.isNullOrUndefined( Dictionary.texts[ key ] ) === true ) {
            return '!--- Traslation missing ---!';
        } else {
            if ( typeof Dictionary.texts[ key ] === 'string' ) {
                return Dictionary.texts[ key ]
            } else {
                return Dictionary.texts[ key ][ Utils.randIndex( Dictionary.texts[ key ].length ) ]
            }
        }


    },
    texts: {
        activity_idle: 'Idle',
        activity_promotion: 'Doing promotion',
        activity_laze: 'Lazing around',
        activity_busk: 'Busking for money',
        activity_record: 'Recording song',

        timeend_laze: 'You stop doing nothing and get back to real life',
        timeend_busk: 'You made a little money and got some pratice, what\'s next then',

        eventRentDue: 'You pay £[rent] in rent',
        eventChartsUpdated: 'The charts has been updated',

        doPromotion_battle: '[manager] books a slot for you in Battle of the Bands [days] days from now',
        doPromotion_interview: '[manager] calls the station an sets it up [days] days from now',

        doDrugs_alcohol: [
            'The booze makes you woozy',
            'Alcoholic kind of mood',
            'Things.. spinning...'
        ],
        doDrugs_lsd: 'Damn.. the world is soo colorful',
        doDrugs_heroin: 'Oh no..',
        doDrugs_marijuana: 'Marijuana makes everything a bit distorted',
        doDrugs_cocaine: 'The cocaine fills your head with crazy ideas!',

        newsChartsEntryUpdateDown: '[entryName] moved down the charts this week',
        newsChartsEntryUpdateUp: '[entryName] moved up the charts this week',
        newsChartsEntryUpdateNumberOne: '[entryName] is still number one',
        newsChartsEntryEnters: '[entryName] enters the charts as no.[entryPosition]',
        newsBandGoesOnTour: '[band] goes on tour'
    }

};

export default Dictionary;