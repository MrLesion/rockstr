import Utils from './Utils.js';

const Speech = {
    synth: null,
    construct: () => {
        Speech.synth = speechSynthesis;
    },
    speak: (txt) => {
    	Speech.synth.cancel();
        let speaking = new SpeechSynthesisUtterance(txt);
        speaking.lang = 'en-GB';
        Speech.synth.speak(speaking);
    }
};

export default Speech;