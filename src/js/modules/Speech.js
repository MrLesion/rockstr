import Settings from '../Settings.js';
import Utils from './Utils.js';

const Speech = {
    synth: null,
    construct: () => {
        Speech.synth = speechSynthesis;
    },
    speak: ( txt ) => {
        if ( Settings.ACTIVE_MODULES.Speech === true ) {
            Speech.synth.cancel();
            let speaking = new SpeechSynthesisUtterance( txt );
            speaking.lang = 'en-GB';
            Speech.synth.speak( speaking );
        }

    }
};

export default Speech;