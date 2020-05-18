import Utils from './modules/Utils.js';

const Dictionary = {
    get: ( key, staticText = false ) => {
        let text = '';
        if ( staticText === true ) {
            text = Dictionary.static[ key ];
        }
        else {
            text = Dictionary.texts[ key ];
        }
        if ( Utils.isNullOrUndefined( text ) === true ) {
            return '!--- Translation key missing: ' + key + ' ---!';
        }
        else {
            if ( typeof text === 'string' ) {
                return text;
            }
            else {
                return text[ Utils.randIndex( text.length ) ]
            }
        }
    },
    texts: {
        activity_idle: 'Idle',
        activity_promotion: 'Doing promotion',
        activity_laze: 'Lazing around',
        activity_busk: 'Busking for money',
        activity_record: 'Recording song',
        activity_tour: 'On tour',

        achievements_firstSong: '★ Damn you just recorded your first song! ★',

        timeend_laze: 'You stop doing nothing and get back to real life',
        timeend_busk: 'You made a little money and got some pratice, what\'s next then',
        timeend_record: 'You are done recording',

        eventRentDue: 'You pay £<-rent-> in rent',
        eventChartsUpdated: 'The charts has been updated',
        event_studio_release: 'The song \'<-song->\' is done and recorded! <-manager-> takes £<-cost-> from your wallet and pays the studio and producer and releases the song.',

        event_interview_done: 'The interview went <-scoretext->',
        doPromotion_battle: '<-manager-> books a slot for you in Battle of the Bands <-days-> days from now',
        doPromotion_interview: '<-manager-> calls the station an sets it up <-days-> days from now',

        tour_register: '<-manager-> books <-tourname-> to begin <-time-> days from now',

        doDrugs_alcohol: [
            'The booze makes you woozy',
            'Alcoholic kind of mood',
            'Things.. spinning...'
        ],
        doDrugs_lsd: 'Damn.. the world is soo colorful',
        doDrugs_heroin: 'Oh no..',
        doDrugs_marijuana: 'Marijuana makes everything a bit distorted',
        doDrugs_cocaine: 'The cocaine fills your head with crazy ideas!',


        charts_user_entry: 'Your song \'<-song->\' is number <-position-> on the charts this week',

        newsChartsEntryUpdateDown: '<-entryName-> moved down the charts this week',
        newsChartsEntryUpdateUp: '<-entryName-> moved up the charts this week',
        newsChartsEntryUpdateNumberOne: '<-entryName-> is still number one',
        newsChartsEntryEnters: '<-entryName-> enters the charts as no.<-entryPosition_>',
        newsBandGoesOnTour: '<-band-> goes on tour',
        studioDay: 'Another day in the studio'
    },
    static: {
        global_health: 'Health',
        global_creativity: 'Creativity',
        global_mentality: 'Mentality',
        global_happiness: 'Happiness',
        battle_header: 'Battle of the Bands'
    }

};

export default Dictionary;
