async function Fetch( url ) {
	let options = {};
	let response = await fetch( url, options );
	let data = await response.json()
	return data;
}

export default Fetch;