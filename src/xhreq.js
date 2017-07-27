;(function(root, factory) {
	'use strict'

	if (typeof define === 'function' && define.amd) {
    	define('xhreq', factory)
  	} 
	else if (typeof exports === 'object') {
    	exports = module.exports = factory()
  	} 
  	else {
    	root.xhreq = factory()
  	}

})(this, function() {
	'use strict'

	var _options = _filterOptions({});

	var methods = ['get', 'put', 'post', 'head', 'delete'];

	/**
	*===============================================================================
	* lib - uricomponent
	* @version v1.2.0
	* @link https://github.com/leojaimesson/encodecomponent#readme
	* @license MIT
	* @author Leo Jaimesson
	* ===============================================================================
	*/
	
	function isArray(array) {
		return Array.isArray(array);
	}

	function isFunction(fn) {
		return typeof(fn) === 'function';
	}

	function normalizeUri(uri) {
		while (uri[uri.length-1] === '&') {
			uri = uri.slice(0, uri.length-1);
		}
		return uri;
	}

	function _buildCodeArray(array,key) {
		var acc = '';
		for(var i = 0; i < array.length; i++) {
			if(!isFunction(array[i])) {
				if(isArray(array[i])){
					acc += _buildCodeArray(array[i], key + '['+ i +']');
				}
				else if(_isObject(array[i])){
					acc +=  normalizeUri(_buildCodeSubObjects( key + '['+ i +']', array[i])) + '&' ;
				}
				else {
					acc += key + '[]=' + array[i] + '&';
				}	
			}
		}
		return acc;
	}

	function _buildCodeSubObjects(prefix, obj) {
		var prefixList = prefix.split(',');
		return Object.keys(obj).reduce(function(acc, item) {
			if(isFunction(obj[item])) {
				return acc;
			}
			if(isArray(obj[item])) {
				return acc + _buildCodeArray(obj[item], prefix + '[' + item + ']');
			}
			if(_isObject(obj[item])){
				return acc + normalizeUri(_buildCodeSubObjects((prefix + '[' + item + ']') ,obj[item])) + '&'
			}
			var pre = prefixList.reduce(function(acc , item) {
				if(acc.length > 0){
					return acc + item + '][';
				}
				return acc + item + '[';
			}, '');
			return acc + pre + item + ']=' + obj[item] + '&';
		},'');
	}

	function _buildCode(obj, name) {
		if(isArray(obj)) {
			return _buildCodeArray(obj, name)
		}
		return Object.keys(obj).reduce(function(acc, item){
			if(isFunction(obj[item])) {
				return acc;
			}
			if(isArray(obj[item])) {
				return acc +  _buildCodeArray(obj[item], item);
			}
			if(_isObject(obj[item])){
					return  acc + normalizeUri(_buildCodeSubObjects(item ,obj[item])) + '&';
			}
			return acc + item + '=' + obj[item] + '&';
		}, '');
	}
	
	function _objectToQueryString(component, name) {
		return _isObject(component) ? encodeURIComponent(normalizeUri(_buildCode(component, name))).replace(/%3D/ig, '=').replace(/%26/ig, '&') : component;
	}

	/**
	*===================================================================================
	* lib - uricomp
	*===================================================================================
	*/ 

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
			return header.toLowerCase() === 'content-type';
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
				xhr.send(_objectToQueryString(data));
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
		return typeof(data) === 'object' && data !== null;
	}

	function _configure(options) {
		_options = _filterOptions(options);
	}

	function xhreq(options) {
		return _send(options);
	}

	xhreq.configure = function(options) {
		_configure(options);
	}

	//add métodos get, put, post, delete, head
	methods.forEach(function(value) {
		xhreq[value] = function(url, data) {
			return _xhr_connect(value, _options.baseURL + url, data ? data : null, _filterOptions(_options));
		}
	});

	return xhreq;
});