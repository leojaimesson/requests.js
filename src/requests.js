;(function(root, factory) {
	'use strict'
	if (typeof exports === 'object') {
    	exports = module.exports = factory()
  	} 
  	else {
    	root.request = factory()
  	}

})(this, function() {
	'use strict'

	function response(xhr) {
		return {
			status : xhr.status,
        	ok : (xhr.status >= 200 && xhr.status < 300),
        	statusText : (xhr.statusText ? xhr.statusText : 'OK'),
        	headers : xhr.getAllResponseHeaders(),
        	url : xhr.url || '',
        	body : xhr.responseText || ''
		}
	}

	function addHeaders(xhr, headers) {
		headers = headers || {};

		var hasContentType = Object.keys(headers).some(function(header) {
			return header == 'content-type';
		})

		if(!hasContentType){
			xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		}

		Object.keys(headers).forEach( function(value, header) {
			xhr.setRequestHeader(header, value);
		});
	}

	function encode(data) {
		return Object.keys(data).reduce(function(prev, item){
			return (!prev ? '' : prev + '&') + encodeURIComponent(item) + '=' + encodeURIComponent(data[item]);
		}, '');
	}

	function isObject(data) {
		return typeof(data) === 'object' || Object.prototype.toString.call(data) === '[object Object]';
	}

	function dataPreProcess(rawData) {
		return isObject(rawData) ? encode(rawData) : rawData;
	}

	function xhr_connect(method, url, data, options) {
		
		return new Promise(function(resolve, reject) {		
			var xhr = new XMLHttpRequest();
			xhr.open(method, url, true);
			xhr.withCredentials = options.credentials ? options.credentials : false;
			addHeaders(xhr, options.headers);
			xhr.timeout = options.timeout || 0;
			xhr.onload = function() {
				if(xhr.status >= 200 && xhr.status < 300) {
                    resolve(response(xhr))
                }else{
                    reject(response(xhr));
                }
			}
			xhr.onerror = function() {
                reject(new TypeError("Network request failed."));
            }
            xhr.ontimeout = function() {
                reject(new TypeError("Network request failed."));
            }
			try{
				xhr.send(dataPreProcess(data) || null);
			} catch(e) {
				reject(new TypeError("Given is invalid, it is necessary to be a string in json format."));
			}
		})
	}

	function filterOptions(options) {
		return {
			credentials : options.credentials ? 1 : 0, //se não for undefined ou null retorna 0  senão 1
			urlBase : options.urlBase || '',
			timeout : options.timeout || 0,
			headers : options.headers || {}
		}
	}

	function send(options) {
		return xhr_connect(options.method, request.options.urlBase + options.url, options.data, options);
	}

	function request(options) {
		if(options) {
			request.options = filterOptions(options);
		}
		return send(options);
	}

	return request;
});