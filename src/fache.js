/**
 * Fetch and cache
 */

{
    'use strict';

    class FacheStorage {

        /**
         * Constructor 
         * 
         */
        constructor() {

            this.requestResponsePairs = [];
        }

        /**
         * Validate and normalize init settings
         */
        normalizeInitSettings( init ) {

            let defaultSettings = {

                seconds: 60,
                shouldExpire: requestResponsePair => true
            };

            let settings = Object.assign( {}, init );

            if ( typeof init === 'undefined' ) {
                /* pass */
            }
            else if ( typeof init === 'object' ) {

                if ( init.seconds !== undefined && typeof init.seconds !== 'number' ) {
                    
                    throw new FacheError( '`seconds` should be a number or undefined.' );
                }

                if ( init.shouldExpire === undefined || typeof init.shouldExpire === 'function' ) {
                    /* pass */
                }
                else if ( typeof init.shouldExpire === 'boolean' ) {

                    settings.shouldExpire = () => init.shouldExpire;
                }
                else {

                    throw new FacheError( '`shouldExpire` should be a function or undefined.' );
                }
            }
            else {

                throw new FacheError( '`init` should be an object or undefined.' );
            }

            return Object.assign( {}, defaultSettings, settings );
        }

        /**
         * Fetch by URL or a Request object, then cache the response
         *
         * @param {string|Object} urlOrRequest - A URL string or a Request object
         * @param {Object} settings - Contains both init settings of Fetch API and init settings of 
         *                        cache method
         * @returns {Promise} - A fetched promise with a cloned response
         */
        cache( urlOrRequest, settings ) {

            let request = this.pickRequest( urlOrRequest );
            let reqResPair = new RequestResponsePair( request );

            reqResPair.invalidateResponse( 
                settings.seconds, 
                settings.shouldExpire,
                () => this.removePair( reqResPair )
            );

            this.requestResponsePairs.push( reqResPair );

            reqResPair.fetchPromise = fetch( request, settings );
            
            return reqResPair.fetchPromise.then( response => { 

                reqResPair.response = response.clone();

                return response.clone();
            } );
        }

        /**
         * Look up for a RequsetResponsePair object. If not found or expired, then start fetch
         * and cache again. Otherwise return the exiting fetch promise.
         *
         * @param {string|Object} - Same as cache method
         * @param {Object} - Same as `settings` in cache method
         */
        promiseGetResponse( urlOrRequest, init ) {

            let setttings = this.normalizeInitSettings( init );
            let reqResPair = this.getPair( urlOrRequest );

            if ( reqResPair === null ) {

                return this.cache( urlOrRequest, setttings );
            }

            return reqResPair.fetchPromise.then( response => response.clone() );
        }

        pickRequest( urlOrRequest ) {

            let request = null;

            if ( typeof urlOrRequest === 'string' ) {

                request = new Request( urlOrRequest );
            }
            else if ( urlOrRequest instanceof Request ) {

                request = urlOrRequest;
            }
            else {

                throw new FacheError( 'Require a URL or a Request instance.' );
            }

            return request;
        }

        pickUrl( urlOrRequest ) {

            let url = '';

            if ( typeof urlOrRequest === 'string' ) {

                url = urlOrRequest;
            }
            else if ( urlOrRequest instanceof Request ) {

                url = urlOrRequest.url;
            }
            else {

                throw new FacheError( 'Require a URL or a Request instance.' );
            }

            return url;
        }    

        getPair( urlOrRequest ) {

            let url = this.pickUrl( urlOrRequest );

            for ( let i = 0; i < this.requestResponsePairs.length; i ++ ) {

                if ( url === this.requestResponsePairs[i].url ) {

                    return this.requestResponsePairs[i];
                }
            }

            return null;
        }

        removePair( reqResPair ) {

            let index = this.requestResponsePairs.indexOf( reqResPair );

            if ( index >= 0 ) {

                this.requestResponsePairs.splice( index, 1 );
                return true;
            }

            return false;
        }
    }

    class RequestResponsePair {

        constructor( request ) {

            if ( request instanceof Request === false) {

                throw new FacheError( 'Require an instance of Request or RequestRef.' );
            }

            this.request = request;
            this.url = this.request.url;
            this.response = null;
            this.fetchPromise = null;            
        }

        invalidateResponse( seconds, shouldExpire, onExpire ) {

            if ( seconds <= 0 ) {

                return;
            }

            setTimeout( () => {

                if ( shouldExpire( this ) === true ) {

                    onExpire( this );
                }

            }, seconds * 1000 );
        }
    } 

    class FacheError extends Error {

        constructor( message ) {

            super( `[Fache] ${message}\n` );
            this.name = this.constructor.name;

            if ( typeof Error.captureStackTrace === 'function' ) {
            
                Error.captureStackTrace( this, this.constructor );

            } else {

                this.stack = ( new Error( message ) ).stack; 
            }
        }
    }

/* Main *******************************************************************************************/

    let facheStorage = new FacheStorage();
    let fache = ( urlOrRequest, init ) => facheStorage.promiseGetResponse( urlOrRequest, init );

/* Expose to window object ************************************************************************/

    if ( typeof window === 'undefined' ) {

        throw new FacheError( 'Fache runs only in the context of a browser.' );
    }
    else if ( window.fetch === undefined ) {

        throw new FacheError( 'Fache requires Fetch API. Look for a polyfill.' );
    }
    else {

        window.fache = fache;
        window.fache.storage = facheStorage;
    }

/* Expose to node application that runs in a browser e.g. React, Angular, Vue, etc ****************/

    if ( typeof module !== 'undefined' ) {

        module.exports = {

            fache: fache,
            FacheStorage: FacheStorage
        };
    }
}

