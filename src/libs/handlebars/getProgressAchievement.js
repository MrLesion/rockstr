import Settings from '../../js/Settings.js';

export default function(current, goal, options) {
    if ((current / Settings.FAME_PROGRESS_FACTOR) >= goal) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
}