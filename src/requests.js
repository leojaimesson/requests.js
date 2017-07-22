;(function(root, factory) {
	'use strict'

	if (typeof define === 'function' && define.amd) {
    	define('request', factory)
  	} 
	else if (typeof exports === 'object') {
    	exports = module.exports = factory()
  	} 
  	else {
    	root.request = factory()
  	}

})(this, function() {
	'use strict'

	var _options = _filterOptions({});

	function _response(xhr) {
		return {
			status : xhr.status,
        	ok : (xhr.status >= 200 && xhr.status < 300),
        	statusText : (xhr.statusText ? xhr.statusText : 'OK'),
        	headers : xhr.getAllResponseHeaders(),
        	url : xhr.url || '',
        	body : xhr.responseText || ''
		}
	}

	function _hasContentType(headers) {
		return Object.keys(headers).some(function(header) {
			return header == 'content-type';
		});
	}

	function _addHeaders(xhr, headers) {
		headers = headers || {};

		if(!_hasContentType(headers)){
			xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		}

		Object.keys(headers).forEach( function(value, header) {
			xhr.setRequestHeader(header, value);
		});
	}

	function _xhr_connect(method, url, data, options) {
		return new Promise(function(resolve, reject) {		
			var xhr = new XMLHttpRequest();
			xhr.open(method, url, true);
			xhr.withCredentials = options.credentials ? options.credentials : false;
			_addHeaders(xhr, options.headers);
			xhr.timeout = options.timeout || 0;
			xhr.onload = function() {
				if(xhr.status >= 200 && xhr.status < 300) {
                    resolve(_response(xhr))
                }else{
                    reject(_response(xhr));
                }
			}
			xhr.onerror = function() {
                reject(new TypeError("Network request failed."));
            }
            xhr.ontimeout = function() {
                reject(new TypeError("Network request failed."));
            }
			try{
				xhr.send(data || null);
			} catch(e) {
				reject(new TypeError("Given is invalid, it is necessary to be a string in json format."));
			}
		})
	}

	function _filterOptions(options) {
		return {
			credentials : options.credentials ? 1 : 0, //se não for undefined ou null retorna 0  senão 1
			baseURL : options.baseURL || '',
			timeout : options.timeout || 0,
			headers : options.headers || {}
		}
	}

	function _send(options) {
		return _xhr_connect(options.method, _options.baseURL + options.url, options.data, _filterOptions(options));
	}

	function _isObject(data) {
		return typeof(data) === 'object' || Object.prototype.toString.call(data) === '[object Object]';
	}

	function _preProcess(rawData , callback) {
		return _isObject(rawData) ? callback(rawData) : rawData;
	}

	function _encode(data) {
		return Object.keys(data).reduce(function(prev, item){
			return (!prev ? '' : prev + '&') + encodeURIComponent(item) + '=' + encodeURIComponent(data[item]);
		}, '');
	}

	function _json(data) {
		return JSON.stringify(data);
	}

	function _configure(options) {
		_options = _filterOptions(options);
	}

	function request(options) {
		return _send(options);
	}

	request.encode = function(rawData) {
		return _preProcess(rawData, _encode);
	}

	request.json = function(rawData) {
		return _preProcess(rawData, _json);
	}

	request.configure = function(options) {
		_configure(options);
	}

	return request;
});
