ajax=function(b,c){add_host=function(a){return document.domain?a:"http://root.org.ua"+a};$.ajax({url:add_host(b),dataType:"json",success:function(a){c(a.results)}})};
