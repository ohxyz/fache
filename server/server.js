const express = require( 'express' );
const APP = express();
const PORT = 5001;

function allowCors( request, response, next ) {
    
    response.set( 'Access-Control-Allow-Origin', '*' );
    next();
}

function setHeaders( request, response, next ) {

    response.set( 'Content-Type', 'application/json; charset=utf-8' );
    response.set( 'my-header', 'is not small' );
    next();
}

APP.use( express.static( 'src' ) );
APP.use( express.static( 'test/web' ) );
APP.use( express.static( 'browser' ) );

APP.use( setHeaders );

APP.use( ( request, response, next ) => {

    console.log( 'Before 1' );
    next();
} )

APP.get( '/debug', ( request, response ) => { 

    response.status( 200 );
    response.send( '"Debug"' );
} );

APP.get( '/400', ( request, response ) => { 

    response.status( 400 );
    response.send( '400' );
} );

APP.get( '/sleep/:seconds', ( request, response ) => { 

    let seconds = request.params.seconds;

    console.warn( 'sleep');

    setTimeout( () => { 

        console.warn( `Wakeup after ${seconds} second(s).` );
        let dateString = new Date().toISOString().slice( 11, 19 );

        response.send( `[${dateString}] Slept for ${seconds} seconds.` );

    }, seconds * 1000 );
} )

APP.get( '/text', ( request, response ) => { 

    let content = 'Hello World!';

    response.send( content );

} );

APP.get( '/json', ( request, response ) => { 

    let o = { a: 1, b: null, c: undefined, d: false };
    response.send( o );

} );

APP.listen( PORT, () => {

    console.log( `Server started, listening at port: ${PORT}` );
} );
