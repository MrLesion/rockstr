import Constants from '../Constants.js';

const Speech = {
    synth: null,
    construct: () => {
        Speech.synth = speechSynthesis;
    },
    speak: ( txt ) => {
        if ( Constants.ACTIVE_MODULES_SPEECH === true ) {
            Speech.synth.cancel();
            let speaking = new SpeechSynthesisUtterance( txt );
            speaking.lang = 'en-GB';
            Speech.synth.speak( speaking );
        }

    }
};

export default Speech;