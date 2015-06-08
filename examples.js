//example usage
var express = require('express');
var creditr = require('./');

var params = {
    repo: 'your/repo',
    accessToken: 'an access_token for github'
};

var creditSystem = creditr(params);

creditSystem.retreiveCredits(function(credits) {
    var creditsPage = creditSystem.formatting.table(credits);
    var app = express();

    app.get('/credits', function (req, res) {
        res.send(creditsPage);
    });

    var server = app.listen(7080, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('Running on http://%s:%s', host, port);

    });

});
