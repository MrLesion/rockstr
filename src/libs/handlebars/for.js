export default function ( counter, options ) {

	let accum = '';
	for ( let i = 0; i < counter; ++i ) {
		accum += options.fn( i );
	}
	return accum;

}