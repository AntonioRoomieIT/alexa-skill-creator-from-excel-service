const lambdaLocal = require('lambda-local');

var jsonPayload = {
    query:"X"
   };

lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: ('index.js'),
    profilePath: '~/.aws/credentials',
    profileName: 'Roomie-Profuturo',
    timeoutMs: 60000
}).then(function(done) {
    console.log(done);
}).catch(function(err) {
    console.log(err);
});