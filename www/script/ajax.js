/**
 * Copyright (c) 2013 Dennis Shtatnov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*
	AJAX Static Namespace
*/

var ajax = {
	xmlhttp : null,
	send: function(url, method, callback, data) {
		method = method.toUpperCase()
		ajax.xmlhttp.onreadystatechange = function() {
			if (ajax.xmlhttp.readyState==4 /*&& ajax.xmlhttp.status==200*/) {
				/* https://developer.mozilla.org/en-US/docs/DOM/DOMParser */
				/* https://developer.mozilla.org/en-US/docs/Code_snippets/HTML_to_DOM?redirectlocale=en-US&redirectslug=Code_snippets%3AHTML_to_DOM */
				
				if(ajax.xmlhttp.status != 200){
					callback(null)	
				}
				else{
					callback(ajax.xmlhttp.responseText);
				}
			}
		}
		
		var data2 = "";
		if(method == "POST")
		{
			for (var key in data) {
				data2 += key + "=" + encodeURIComponent(data[key]) + "&";
			}
			data2 = data2.substring(0, data2.length);
		}
		
		ajax.xmlhttp.open(method, url, true);
		if(method == "POST")
			ajax.xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		ajax.xmlhttp.send((method == "POST" ? data2:null));
	},
};

if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	ajax.xmlhttp=new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	ajax.xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
