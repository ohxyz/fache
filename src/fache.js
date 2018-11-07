/*
 * fetch and cache
 */

class Fache {

    /**
     * Constructor 
     * @param {Object} config - expire, etc
     */
    constructor( config ) {

        console.log( 'construct' );
        this.config = config;

        this.requests = [];
        this.responses = [];
    }

    /**
     * Fetch by URL or a Request object
     */
    cache( urlOrRequest, config = this.config ) {

        let request; 

        if ( typeof urlOrRequest === 'string' ) {

            request = new Request( urlOrRequest );
        }
        else if ( urlOrRequest instanceof Request ) {

            request = urlOrRequest;
        }
        else {

            throw Error( '[fache] Require a URL or a Request object.\n' );
        }

        this.requests.push( request );

        fetch( urlOrRequest ).then( response => { 

            this.responses.push( response );
        } );
    }
}

let fache = new Fache( { a: 1 } );

// fache.cache( { b: 1 } ); 

fache.cache( '/text' );

let req = new Request( '/json' );

fache.cache( req );

console.warn( 'responses', fache.requests );
console.warn( 'responses', fache.responses );