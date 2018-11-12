/**
 * Fetch and cache
 */

{
    class FacheStorage {

        /**
         * Constructor 
         * 
         */
        constructor() {

            this.requestResponsePairs = [];
            this.defaultInitSettings = {

                seconds: 60,
                shouldExpire: ( request, response ) => true
            };
        }

        validateInit( init ) {

            if ( typeof init === 'undefined' ) {
                /* pass */
            }
            else if ( typeof init === 'object' ) {

                if ( init.seconds !== undefined && typeof init.seconds !== 'number' ) {
                    
                    throw new FacheError( '`seconds` should be a number.' );
                }

                if ( init.shouldExpire !== undefined && typeof init.shouldExpire !== 'function' ) {

                    throw new FacheError( '`shouldExpire` should be a function.' );
                }
            }
        }

        /**
         * Fetch by URL or a Request object, then cache the response
         *
         * @param {string|Object} urlOrRequest - A URL string or a Request object
         * @param {Object} init - Contains both init settings of Fetch API and init settings of 
         *                        cache method
         * @returns {Promise} - A fetched promise with a cloned response
         */
        cache( urlOrRequest, init ) {

            let settings = Object.assign( {}, this.defaultInitSettings, init );
            let request = this.pickRequest( urlOrRequest );

            let reqResPair = new RequestResponsePair( request, {

                cacheLifetime: settings.seconds,
                shouldInvalidateCache: settings.shouldExpire
            } );

            this.requestResponsePairs.push( reqResPair );

            reqResPair.fetchPromise = fetch( request, init );
            
            return reqResPair.fetchPromise.then( response => { 

                reqResPair.response = response.clone();
                reqResPair.isResponseExpired = false;

                return response.clone();
            } );
        }

        /**
         * Look up for a RequsetResponsePair object. If not found or expired, then start fetch
         * and cache again. Otherwise return the exiting fetch promise.
         *
         * @param {string|Object} - Same as cache method
         * @param {Object} - Same as cache method
         */
        promiseGetResponse( urlOrRequest, init ) {

            this.validateInit( init );

            let reqResPair = this.getPair( urlOrRequest );

            if ( reqResPair === null ) {

                return this.cache( urlOrRequest, init );
            }
            else if ( reqResPair.isResponseExpired === true  ) {

                this.removePair( reqResPair );

                return this.cache( urlOrRequest, init );
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

        constructor( request, init ) {

            if ( request instanceof Request === false) {

                throw new FacheError( 'Require an instance of Request or RequestRef.' );
            }

            if ( typeof init === 'object' && typeof init.cacheLifetime !== 'number' ) {

                throw new FacheError( 'Cache lifetime should be a number.' );
            }

            let settings = Object.assign( {}, { cacheLifetime: -1 }, init );

            this.request = request;
            this.url = this.request.url;
            this.cacheLifetime = settings.cacheLifetime; /* in seconds */
            this.shouldInvalidateCache = settings.shouldInvalidateCache;
            this.response = null;
            this.fetchPromise = null;            
            this.isResponseExpired = false;

            this.invalidateResponse();
        }

        invalidateResponse() {

            if ( this.cacheLifetime <= 0 ) {

                return;
            }

            setTimeout( () => {

                if ( this.shouldInvalidateCache( this.request, this.response ) === true ) {

                    /* Does not need to set `this.reponse = null` here
                       Once the response is expired, it will be removed from `reqResPairs` */
                    this.isResponseExpired = true;
                }

            }, this.cacheLifetime * 1000 );
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

