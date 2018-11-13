console.log( 'Test script' );

/* Debug ******************************************************************************************/

function f() {

    let req = new Request( '/sleep/2' );
    let init = {
        seconds: 5,
        shouldCache: response => response.status === 200
    };

    fache( req, init )
        .then( response => {

            console.warn( response );

            return response.text();
        } )
        .then( text => { 

            console.warn( 0, text );

            console.warn( 11, fache.storage.requestResponsePairs[0].response );
            // console.warn( 12, fache.storage.requestResponsePairs[0].response.text() );

            let clone = fache.storage.requestResponsePairs[0].response.clone();
            console.warn( 13, clone );
            let cloneOfClone = clone.clone();
            console.warn( 14, clone.text() );
            console.warn( 15, cloneOfClone.text() );

        } )
}


