import Settings from '../../js/Settings.js';

import * as moment from 'moment';

export default function(strDate) {
	return moment(strDate).format(Settings.DATEFORMAT);
};