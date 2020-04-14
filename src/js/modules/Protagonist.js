import * as Data from './Data.js';

import Utils from './Utils.js';
import Settings from '../Settings.js';
import Store from './Store.js';
import Time from './Time.js';
import Feed from './Feed.js';
import Schedule from './Schedule.js';

/* Vendor */
import * as moment from 'moment';

/* Templates */
import * as topTmp from '../../templates/topbar.hbs';
import * as lastMessageTmp from '../../templates/lastMessage.hbs';

const Protagonist = {
    model: {},
    construct: (stdName = 'PlayerOne', stdGenre = 'Pop') => {
        let savedGamePlayer = Store.get('protagonist');

        let name = savedGamePlayer !== null ? savedGamePlayer.name : stdName;
        let genre = savedGamePlayer !== null ? savedGamePlayer.genre : stdGenre;
        let isPlayer = savedGamePlayer !== null ? savedGamePlayer.isPlayer : true;
        let fame = savedGamePlayer !== null ? savedGamePlayer.fame : 0;
        let money = savedGamePlayer !== null ? savedGamePlayer.money : 100;
        let health = savedGamePlayer !== null ? savedGamePlayer.health : 50;
        let mentality = savedGamePlayer !== null ? savedGamePlayer.mentality : 50;
        let creativity = savedGamePlayer !== null ? savedGamePlayer.creativity : 50;
        let happiness = savedGamePlayer !== null ? savedGamePlayer.happiness : 50;
        let activity = savedGamePlayer !== null ? savedGamePlayer.activity : 'idle';

        Protagonist.model.name = name;
        Protagonist.model.genre = genre;
        Protagonist.model.isPlayer = isPlayer;
        Protagonist.model.fame = fame;
        Protagonist.model.money = money;
        Protagonist.model.health = health;
        Protagonist.model.mentality = mentality;
        Protagonist.model.creativity = creativity;
        Protagonist.model.happiness = happiness;
        Protagonist.model.activity = activity;
        Store.set('protagonist', Protagonist.model);
        Protagonist.bindings();
        Protagonist.update();
    },
    get: (prop) => {
        let stored = Store.get('protagonist');
        if (Utils.isNullOrUndefined(stored) === true) {
            return Protagonist.model[prop];
        } else {
            return stored[prop];
        }
    },
    set: (prop, value, callback = Protagonist.status) => {
        Protagonist.model[prop] = value;
        Store.set('protagonist', Protagonist.model);
        Protagonist.update(callback);
    },
    bindings: () => {
        document.querySelector('.protagonist-action-laze').addEventListener('click', () => {
            Time.run(3, 'laze');
        });

        document.querySelector('.protagonist-action-busk').addEventListener('click', () => {
            let updateObject = Data.events.busk[Utils.randIndex(Data.events.busk.length)];
            Feed.event(updateObject);
            Time.run(0, 'busk', updateObject);
        });
    },
    doDrugs: (eventObj) => {
        let addictions = Store.get('addictions') || {};
        let drug = eventObj.drug;

        let addictionsMods = Data.core.addictions[drug];

        if (Utils.isNullOrUndefined(addictions[drug]) === false) {
            addictions[drug] = {
                trip: addictions[drug].trip + addictionsMods.modifier,
                addictionLevel: addictions[drug].addiction + 1
            }
        } else {
            addictions[drug] = {
                trip: addictionsMods.modifier,
                addictionLevel: 1
            }
        }

        let addictionsLevels = Data.core.addictLevels;

        if (addictions[drug].addictionLevel > 0 && addictions[drug].addictionLevel < 5) {
            addictions[drug].addictionText = Data.core.addictLevels.low;
        } else if (addictions[drug].addictionLevel >= 5 && addictions[drug].addictionLevel < 10) {
            addictions[drug].addictionText = Data.core.addictLevels.medium;
        } else if (addictions[drug].addictionLevel >= 10) {
            addictions[drug].addictionText = Data.core.addictLevels.high;
        }

        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.add(drug + '-trip');
        Store.set('addictions', addictions);

        Object.keys(addictionsMods.update).forEach((key) => {
            let oldValue = Protagonist.get(key);
            Protagonist.set(key, oldValue + addictionsMods.update[key].value);
        });
        Feed.add('doDrugs_' + drug);
        Protagonist.update();
    },
    doPromotion: (eventObj) => {
        let time = Store.get('time') !== null ? Store.get('time').date : Settings.STARTDATE;
        let randEventDays = Utils.randInt(10);
        let promotion = Data.core.promotions[eventObj.promotion];
        let eventDate = moment(time).add(randEventDays, 'days');
        let jobs = Store.get('jobs');
        let manager = jobs.filter((npc) => {
            return npc.job === 'manager';
        })[0];
        Schedule.register(eventObj, eventDate);

        Feed.add('doPromotion_' + eventObj.promotion, { manager: manager.name, days: randEventDays });

        //Time.run(0, 'promotion', promotion);
    },
    status: () => {
        let protagonistStats = Protagonist.model;
        //console.group('Protagonist status:');
        Object.keys(protagonistStats).forEach((key) => {
            //console.log(key, protagonistStats[key]);
            if (typeof protagonistStats[key] === 'number') {
                if (protagonistStats[key] > 10 && protagonistStats[key] <= 30) {
                    console.warn(key + ' is quite low');
                } else if (protagonistStats[key] > 0 && protagonistStats[key] <= 10) {
                    console.error(key + ' is VERY low');
                } else if (protagonistStats[key] <= 0) {
                    if (key !== 'fame') {
                        Protagonist.endGame(key);
                    }

                }
            }
        });
        //console.groupEnd();
    },
    update: (fnCallback) => {
        const container = document.querySelector('.hbs-container-topbar');
        container.innerHTML = topTmp({ protagonist: Protagonist.model, time: Store.get('time'), npc: Store.get('jobs'), addictions: Store.get('addictions') });
        if (typeof fnCallback === 'function') {
            fnCallback();
        }
    },
    endGame: (key) => {
        const container = document.querySelector('.hbs-container-last');
        let timeLived = Store.get('time') !== null ? Store.get('time').daysAlive : 0;
        let endObj = {
            msg: '',
            time: 'You lived the life of a cool musician for ' + timeLived + ' days'
        };
        let endNotes = '';
        if (key === 'money') {
            endObj.msg = 'You ran out of money';
        } else if (key === 'mentality') {
            endObj.msg = 'You went crazy';
        } else if (key === 'happiness') {
            endObj.msg = 'Your sadness overwhelmed you and you slid your own wrists';
        } else if (key === 'health') {
            endObj.msg = 'Your body couldn\'t take anymore - it simply gave up and collapsed';
        } else if (key === 'health') {
            endObj.msg = 'Your interest in the creative arts have withered. You give up music and become a banker';
        }
        container.innerHTML = lastMessageTmp(endObj);
    }
};

export default Protagonist;