var request = require('request');
var _ = require('underscore');

function realNamedCredits(people, callback) {
    var countedCallback = _.after(people.length, callback);
    var peopleWithRealNames = [];

    people.forEach(function(person) {
        var params = {
            headers: {'user-agent': 'node.js'},
            url: person.author.url
        };

        request(params, function(err, res, body) {
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

            var statsUrl = 'stats/contributors';
            if(options.accessToken) {
                statsUrl = [
                    statsUrl,
                    '?access_token=',
                    options.accessToken
                ].join('');
            }

            var params = {
                headers: {'user-agent': 'node.js'},
                url: [
                    'https://api.github.com/repos',
                    options.repo,
                    statsUrl
                ].join('/')
            };

            request(params, function(err, res, body) {
                body = JSON.parse(body);

                if (err) callback(err);
                else if(body && body.message === "Not Found") callback(body);
                else realNamedCredits(body, function (err, credits) {
                    if (err) callback(err);

                    callback(err, _.sortBy(credits, function(credit) {
                        return -credit.commits;
                    }));
                });
            });
        },

        format: {
            table: function (credits) {

                var htmlTable = [
                    '<table>',
                    '<thead><td>Commits</td><td>Name</td><td>Photo</td></thead>',

                    function(){

                        return credits.map(function(person) {

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
            },

            csvNames: function(credits) {

                return credits.map(function(person) {
                    return person.name;
                }).join(', ');

            }
        }

    };
};
