# Introduction
Fache is a utility built on top of browser's Fetch API. It caches the result(Response object). When next time you call Fache API, it returns a promise with cached Response object from last call, until it expires.

# Usage
For adding directly to a web page, go to `browser` folder and download `fache.js`.

If you are developing a web application e.g. React, Angular,etc in a Node environment, then
```
npm i fache
```
Note that, as it uses Fetch API, so make sure your application will run in a modern browser.

# Difference between Fetch and Fache
It uses same arguments as Fetch API, https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch. The only difference is Fache adds more in the second parameter. 

### Example of fetch
```
fetch( '/api/data', { method: 'GET' } )
```

### Example of fache
It caches the response for 10 seconds. Default `seconds` is `60`.
```
fache( '/api/data', { method: 'GET', seconds: 10 } )
```