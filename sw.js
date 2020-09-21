const version = '1.0.0';
const preCache = 'PRECACHE-'+version;
const cacheList = [
    './index.html',
    './main.js',
    './style.css',
    './img/favicon.ico'
];

self.addEventListener('install', (event) => {
    console.log("Installing the service worker");
    self.skipWaiting();

    caches.open(preCache).then((cache) => {
        return cache.addAll(cacheList);
    });
});


self.addEventListener( "activate", function ( event ) {
    event.waitUntil(
        caches.keys().then( cacheNames => {

            cacheNames.forEach( value => {
                if ( value.indexOf( version ) < 0 ) {
                    caches.delete( value );
                }
            });

            console.log("service worker activated");
            return;
        } )
    );
} );

// self.addEventListener( "fetch", function ( event ) {
//
//     event.respondWith(
//
//         caches.match( event.request )
//             .then( function ( response ) {
//
//                 if ( response ) {
//                     return response;
//                 }
//
//                 return fetch( event.request );
//             } )
//     );
//
// } );

self.addEventListener('fetch', function(event) {

    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();

                caches.open(preCache).then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                // return caches.match(''); // aqui poderia ir uma imgaem 404...
                console.log('Couldn\'t load the cache match :(');
            });
        }
    }));
});
