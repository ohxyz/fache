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
APP.use( express.static( 'test' ) );
APP.use( setHeaders );

APP.use( ( request, response, next ) => {

    console.log( 'Before 2' );
    console.log( request.headers );
    next();
} )

APP.get( '/debug', ( request, response ) => { 



    response.status( 200 );
    response.send( '"Root"' );

} );

APP.get( '/400', ( request, response ) => { 

    
    response.status( 400 );
    response.send( '400' );

} );


APP.listen( PORT, () => {

    console.log( `Listening at port: ${PORT}` );
} );