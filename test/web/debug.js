console.log( 'Test script' );

/* Debug ******************************************************************************************/

function s( response ) {

    return response.status === 200 ? 30 : 0.
}

function f() {

    let req = new Request( '/sleep/2' );
    let init = {
        seconds: s,
        method: 'get'
    };
    fache( '/sleep/1', init )
    fache( '/sleep/2', init )
        .then( response => {

            console.warn( response );

            return response.text();
        } )
        .then( text => { 

            console.warn( 0, text );

            console.warn( 11, fache.manager.cachedPairs[0].response );
            // console.warn( 12, fache.manager.cachedPairs[0].response.text() );

            let clone = fache.manager.cachedPairs[0].response.clone();
            console.warn( 13, clone );
            let cloneOfClone = clone.clone();
            console.warn( 14, clone.text() );
            console.warn( 15, cloneOfClone.text() );

        } )

    fache( '/sleep/3', init );

    fache( '/sleep/2', {
        seconds: s,
        method: 'get'
    } )
        .then( response => {

            console.warn( response, 'cached' );

            return response.text();
        } )
        .then( text => { 

            console.warn( 0, 'cached', text );
        } )
}

