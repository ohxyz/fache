console.log( 'Test script' );

/* Debug ******************************************************************************************/

function f() {

    let req = new Request( '/sleep/2' );
    let init = { method: 'GET', seconds: 10 }

    fache( req, init )
        .then( response => {  

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

