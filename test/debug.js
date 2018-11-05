console.log( 'Test script' );

const URL = 'http://127.0.0.1:5001';

fetch( URL+'/debug' )
    .then( response => {

        console.warn( 'Response object:', response );

        response.headers.forEach(  (val, key ) => { 

            console.warn( `[${key}] ${val}` ); 
        } );

        return response.json();

    } )
    .then( returnValue => { 

        console.warn( 'Return value:', returnValue );
        
        if ( returnValue === 'Root' ) {
            
            return 'Good';
        }
        else {

            throw new Error( 'Not root' );
        }
    } )
    .then( result => {

        console.warn( result );
    } )
    .catch( error => {

        console.error( 'Something wrong:', error.name, error.message );
    } );