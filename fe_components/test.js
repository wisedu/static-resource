load: function(query, callback) {
        if (!query.length) return callback();
        $.ajax({
            url: 'http://api.rottentomatoes.com/api/public/v1.0/movies.json',
            type: 'GET',
            dataType: 'jsonp',
            data: {
                q: query,
                page_limit: 10,
                apikey: 'w82gs68n8m2gur98m6du5ugc'
            },
            error: function() {
                callback();
            },
            success: function(res) {
                callback(res.movies);
            }
        });
    }