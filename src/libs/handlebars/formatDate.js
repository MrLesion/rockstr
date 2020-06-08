import Constants from '../../js/Constants.js';

import * as moment from 'moment';

export default function ( strDate ) {
	return moment( strDate ).format( Constants.DATE_FORMAT );
}