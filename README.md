# Introduction
Fache is a utility built on top of browser's Fetch API. It caches the result(Response object). When next time you call Fache API, it returns a promise with cached Response object from last call, until it expires.

# Install
For adding directly to a web page, go to `browser` folder and download `fache.js`.

If you are developing a web application e.g. React, Angular,etc in a Node environment, then
```
npm i fache
```
Note that, as it uses Fetch API, make sure your application will run in a modern browser. Alternatively, look for a polyfill.

# Difference between Fetch and Fache
It has same parameters as Fetch API, https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch. The difference is Fache adds more in the second parameter. 

### Example of fetch
```
fetch( '/api/data', { method: 'GET' } )
```

### Example of fache
It caches the response for subsequent Fache calls for 10 seconds. 
```
fache( '/api/data', { method: 'GET', seconds: 10 } )
```
Default `seconds` is 60.

##### Note that
1. Time to invalidate the cache starts when the first Fache call's response is received.
2. If a subsequent call has same Request or URL but different `seconds` value, e.g. `20`, then it will __NOT__ update the cache lifetime of the first call until the response of first call expires.

### More settings of second parameter

| Settings      | Type           | Description                                                            |
| ------------- | -------------  | ---------------------------------------------------------------------- |
| seconds       | Number         | Time in seconds to invalidate cached response after response received  |
| shouldCache   | Function       | Return false, it will not cache the response                           |

##### Example
```
{
    seconds: 10,
    shouldCache: response => response.status === 200
}
```