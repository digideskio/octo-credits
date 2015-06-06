var request = require('request');
var _ = require('underscore');

function realNamedCredits(people, accessToken, callback) {
    var countedCallback = _.after(people.length, callback);
    var peopleWithRealNames = [];

    people.forEach(function(person) {
        var url = [person.author.url ,'?access_token=', accessToken].join('');
        var params = {
            headers: {'user-agent': 'node.js'},
            url: url
        };

        request(params, function (err, res, body) {
            if(err) console.log(err);
            body = JSON.parse(body);
            peopleWithRealNames.push({
                name: body.name || body.login,
                commits: person.total,
                avatar: body.avatar_url,
                html_url: body.html_url
            });

            countedCallback(err, peopleWithRealNames);
        });
    });
}

module.exports = function(options) {
    return {
        retreiveCredits: function (callback) {
            var params = {
                headers: {'user-agent': 'node.js'},
                url: [
                    'https://api.github.com/repos/',
                    options.repo,
                    '/stats/contributors?access_token=',
                    options.accessToken
                ].join('')
            };

            request(params, function (err, res, body) {
                if (err) console.log(err);

                realNamedCredits(JSON.parse(body), params.accessToken, function (err, credits) {
                    if (err) console.log(err);

                    callback(_.sortBy(credits, function(credit) {
                        return -credit.commits;
                    }));
                });
            });
        },

        table: function (credits) {

            var htmlTable = [
                '<table>',
                '<thead><td>Commits</td><td>Name</td><td>Photo</td></thead>',

                function(){

                    return credits.map(function (person) {

                        return [
                            '<tr><td>',
                            person.commits,
                            '</td><td>',
                            '<a href=',person.html_url,'>',
                            person.name,
                            '</a>',
                            '</td><td>',
                            '<img src=',person.avatar,' width="100" height="100" />',
                            '</td></tr>'
                        ].join('');

                    }).join('');
                }(),
                '</table>'
            ].join('');

            return htmlTable;
        }
    };
};
