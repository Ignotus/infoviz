ajax = function(path, func) {
    add_host = function(path) {
        return document.domain ? path : 'http://root.org.ua' + path;
    }

    $.ajax({
        url: add_host(path),
        dataType: 'json',
        success: function load(d) {
            func(d.results);
        }
    });
}