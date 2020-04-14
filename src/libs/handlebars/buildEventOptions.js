import Bands from '../../js/modules/Bands.js';

export default function(optionArr, optionAction) {
    if (optionAction === 'addSongs') {
        optionArr.push('All songs');
    } else if (optionAction === 'addBands') {
        let allBands = Bands.getAllBands();
        for (let i = allBands.length - 1; i >= 0; i--) {
            optionArr.push(allBands[i].name);
        }
    }
    return optionArr;
};