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

                seconds: 60
            };
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
            let reqResPair = new RequestResponsePair( request );

            this.requestResponsePairs.push( reqResPair );

            reqResPair.fetchPromise = fetch( request, init );
            reqResPair.createdAt = new Date();
            reqResPair.expireAt = new Date( 
                reqResPair.createdAt.getTime() + settings.seconds * 1000 
            );

            reqResPair.requestSentAt = new Date();
            
            return reqResPair.fetchPromise.then( response => { 

                reqResPair.responseReceivedAt = new Date();
                reqResPair.response = response.clone();

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

            let reqResPair = this.getPair( urlOrRequest );

            if ( reqResPair === null ) {

                return this.cache( urlOrRequest, init );
            }
            else if ( reqResPair.expireAt < new Date() ) {

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

        constructor( request ) {

            if ( request instanceof Request === false) {

                throw new FacheError( 'Require an instance of Request or RequestRef.' );
            }

            this.request = request;
            this.response = null;
            this.fetchPromise = null;
            this.url = this.request.url;
            this.createdAt = new Date();
            this.expireAt = null;
            this.requestSentAt = null;
            this.responseReceivedAt = null;
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

/* Expose to window object ************************************************************************/

    let facheStorage = new FacheStorage();
    
    window.fache = ( urlOrRequest, init ) => facheStorage.promiseGetResponse( urlOrRequest, init );
    window.fache.storage = facheStorage;
}

