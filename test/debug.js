console.log( 'Test script' );

// const URL = 'http://127.0.0.1:5001';

// fetch( URL+'/debug' )
//     .then( response => {

//         console.warn( 'Response object:', response );

//         response.headers.forEach(  (val, key ) => { 

//             console.warn( `[${key}] ${val}` ); 
//         } );

//         return response.json();

//     } )
//     .then( returnValue => { 

//         console.warn( 'Return value:', returnValue );
        
//         if ( returnValue === 'Root' ) {
            
//             return 'Good';
//         }
//         else {

//             throw new Error( 'Not root' );
//         }
//     } )
//     .then( result => {

//         console.warn( result );
//     } )
//     .catch( error => {

//         console.error( 'Something wrong:', error.name, error.message );
//     } );

// let url1 = '/text';
// let url2 = '/json';
// let url3 = '/none'

// fetch( url3 )
//     .then( response => { 

//         console.warn( 'response', response );
//     } )
//     .then( result => { 

//         console.warn( 'result', result );

//     } );

// caches.open( 'my-cache' ).then( cache => { 

//     console.warn( 1, cache );

//     cache.add( url1 );

// } );

// caches.open( 'my-cache' ).then( cache => { 

//     console.warn( 2, cache );

//     cache.add( url2 );

// } );

// caches.keys().then( results => { 

//     console.warn( 'keys', results );
// } );

// caches.open( 'my-cache' ).then( cache => {

//     cache.match( url1 ).then( response => console.warn( 3, response ) );
//     cache.match( url2 ).then( response => console.warn( 4, response ) );

// } );

