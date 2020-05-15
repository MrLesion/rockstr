const Animations = {
	tour: {
		gig: {
			readyState: () => {
				let arm = document.querySelector( '.arm' );
				arm.classList.remove( 'hit' );
				arm.classList.add( 'ready' );
			},
			hitState: () => {
				let arm = document.querySelector( '.arm' );
				arm.classList.remove( 'ready' );
				arm.classList.add( 'hit' );
			}
		}
	}
};

export default Animations;