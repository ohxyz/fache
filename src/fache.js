/**
 * Fetch and cache the response
 */
( function () {

    const DEFAULT_CACHE_LIFETIME = 60;

    class FacheManager {

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

                seconds: DEFAULT_CACHE_LIFETIME,
                method: 'GET'
            };

            let settings = Object.assign( {}, defaultSettings, init );

            settings.method = settings.method.toUpperCase();

            if ( typeof settings.seconds === 'number' ) {
                
                settings.getCacheLifeTime = resposne => settings.seconds;
            }
            else if ( typeof settings.seconds === 'function' ) {

                settings.getCacheLifeTime = settings.seconds;
            }

            return settings;
        }

        /**
         * Fetch by URL or a Request object, then cache the response. Note that it only caches GET
         * requests.
         *
         * @param {string|Object} urlOrRequest - A URL string or a Request object
         * @param {Object} settings - Contains both settings of Fetch API and settings of 
         *                            cache method
         * @returns {Promise} A fetched promise with a cloned response
         */
        cache( urlOrRequest, settings ) {

            let request = this.pickRequest( urlOrRequest );

            if ( settings.method !== 'GET' ) {

                return fetch( request, settings );
            }

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

            let settings = this.normalizeInitSettings( init );
            let reqResPair = this.getPair( urlOrRequest );

            if ( reqResPair === null ) {

                return this.cache( urlOrRequest, settings );
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

                // URL could be a relative path. Make it to a full path.
                url = new Request( urlOrRequest ).url;
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

        /**
         * Remove all cached pairs. Means that all cached responses are invalidated.
         */
        clearAll() {

            this.cachedPairs = [];
        }

        /**
         * Clear a cached pair by URL or Request object
         *
         * @returns {number} Return index of the cachedPair or -1 when not found.
         */
        clear( urlOrRequest ) {

            let url = '';
            let request = null;
            let i = 0;

            if ( typeof urlOrRequest === 'string' ) {

                url = new Request( urlOrRequest ).url;

                for ( i = 0; i < this.cachedPairs.length; i ++ ) {

                    if ( url === this.cachedPairs[i].url ) {

                        this.cachedPairs.splice( i, 1 );
                        return i;
                    }
                }
            }
            else if ( urlOrRequest instanceof Request ) {

                requrest = urlOrRequest;

                for ( i = 0; i < this.cachedPairs.length; i ++ ) {

                    if ( request === this.cachedPairs[i].request ) {

                        this.cachedPair.splice( i, 1 );
                        return i;
                    }
                }
            }

            return -1;
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

    let facheManager = new FacheManager();
    let fache = ( urlOrRequest, init ) => facheManager.promiseGetResponse( urlOrRequest, init );

/* Expose to window object ************************************************************************/

    if ( typeof window === 'undefined' ) {

        throw new FacheError( 'Fache runs only in the context of a browser.' );
    }
    else if ( window.fetch === undefined ) {

        throw new FacheError( 'Fache requires Fetch API. Look for a polyfill.' );
    }
    else {

        fache.manager = facheManager;
        fache.clear = urlOrRequest => facheManager.clear( urlOrRequest );
        fache.clearAll = () => facheManager.clearAll();

        window.fache = fache;
    }

/* Expose to node application that runs in a browser e.g. React, Angular, Vue, etc ****************/

    if ( typeof module !== 'undefined' ) {

        module.exports = {

            fache: fache,
            FacheManager: FacheManager
        };
    }

} )();

