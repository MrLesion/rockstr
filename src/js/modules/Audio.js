import Utils from './Utils.js';

/* Vendor */
//https://tonejs.github.io/docs/
import * as Tone from 'tone';

const Audio = {
	play: () => {
		let notes = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];
		let pitch = [ "1", "2", "3", "4", "5", "6", "7" ];
		let length = [ "1", "2", "4", "8" ];
		//let instruments = [ "AMSynth", "FMSynth", "Synth", "MembraneSynth", "PluckSynth", "MonoSynth", "PolySynth" ];
		let noteToPlay = notes[ Utils.randIndex( notes.length ) ] + pitch[ Utils.randIndex( pitch.length ) ];
		let lengthToPlay = length[ Utils.randIndex( length.length ) ] + 'n';
		//let instrumentToPlay = instruments[ Utils.randIndex( instruments.length ) ];
		let effectToPlay = new Tone.BitCrusher( 4 );
		var synth = new Tone.Synth().connect( effectToPlay ).toMaster();
		synth.triggerAttackRelease( noteToPlay, lengthToPlay );
	}
};

export default Audio;