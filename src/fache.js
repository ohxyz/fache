/**
 * Fetch and cache the response
 */


{
    const DEFAULT_CACHE_LIFETIME = 60;

    class FacheStorage {

        /**
         * Constructor 
         * 
         */
        constructor() {

            this.cachedPairs = [];
        }

        /**
         * Validate and normalize init settings
         *
         * @param {Object} init - Initial settings
         * @param {function|number|undefined} seconds - Lifetime of cache. If function, then should
         *                                              return a number type
         *
         * @return {Object} Normalized settings with default values
         */
        normalizeInitSettings( init ) {

            if ( typeof init !== 'undefined' && typeof init !== 'object' ) {

                throw new FacheError( '`init` should be an object or undefined' );
            }

            let defaultSettings = {

                seconds: DEFAULT_CACHE_LIFETIME
            };

            let settings = Object.assign( {}, defaultSettings, init );

            if ( typeof settings.seconds === 'number' ) {
                
                settings.getCacheLifeTime = resposne => settings.seconds;
            }
            else if ( typeof settings.seconds === 'function' ) {

                settings.getCacheLifeTime = settings.seconds;
            }

            return settings;
        }

        /**
         * Fetch by URL or a Request object, then cache the response
         *
         * @param {string|Object} urlOrRequest - A URL string or a Request object
         * @param {Object} settings - Contains both init settings of Fetch API and init settings of 
         *                            cache method
         * @returns {Promise} A fetched promise with a cloned response
         */
        cache( urlOrRequest, settings ) {

            let request = this.pickRequest( urlOrRequest );
            let reqResPair = new RequestResponsePair( request );

            this.cachedPairs.push( reqResPair );

            reqResPair.fetchPromise = fetch( request, settings );
            
            return reqResPair.fetchPromise.then( response => { 

                reqResPair.response = response.clone();

                let cacheLifeTime = settings.getCacheLifeTime( response.clone() );

                if ( cacheLifeTime > 0 ) {

                    reqResPair.invalidateResponse( 
                        cacheLifeTime, 
                        () => this.removePair( reqResPair )
                    );
                }
                else {

                    this.removePair( reqResPair );
                }

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

            for ( let i = 0; i < this.cachedPairs.length; i ++ ) {

                if ( url === this.cachedPairs[i].url ) {

                    return this.cachedPairs[i];
                }
            }

            return null;
        }

        removePair( reqResPair ) {

            let index = this.cachedPairs.indexOf( reqResPair );

            if ( index >= 0 ) {

                this.cachedPairs.splice( index, 1 );
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

        invalidateResponse( seconds, onCacheExpire ) {

            if ( seconds <= 0 ) {

                return;
            }

            setTimeout( () => {
                
                onCacheExpire( this );

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

