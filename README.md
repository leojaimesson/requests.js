# xhreq.js

Uma simples API de requição ajax.

### Assinatura

**Requisição Básica**

```js
xhreq({
    method : [String],
    url : [String],
    data : [Object]
});
```

*Exemplo:*

```js
    xhreq({
        method : 'post',
        url : 'https://exemple.com/api/teste',
        data : {
            name : 'joão',
            age : 31
        }
    });
```

---

**Configuração**

```js
xhreq.configure({
    baseURL : [String],
    credentials : [Boolean],
    timeou : [Number], // Milliseconds
    headers : [Object]
});
```

*Exemplo:*

```js
xhreq.configure({
    baseURL : 'https://exemple.com',
    credentials : false, 
    timeou : 1000, // Milliseconds
    headers : {
        'content-type' : 'application/json'
    }
});
```

[Quando usar credentials?](https://developer.mozilla.org/pt-BR/docs/Web/API/XMLHttpRequest/withCredentials)

---

**Métodos**

```js
xhreq.get([String]);
xhreq.put([String], [Object || String]);
xhreq.post([String], [Object || String]);
xhreq.head([String]);
xhreq.delete([String], [Object || String]);
```

*Exemplo:*

```js
// Sem baseURL
xhreq.post('https://exemple.com/api/teste', {
    name : 'joão',
    age : 31
});

// Com baseURL : 'https://exemple.com'
xhreq.post('/api/teste', {
    name : 'joão',
    age : 31
});
```

### Retorno de Método

Retorna [Promises](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promis).

*Exemplo:*

```js
var promise = xhreq.post('/api/teste', {
    name : 'joão',
    age : 31
});

promise.then(
    function(data) {
        //faz algo com o dado retornado
    }
).catch(
    function(error) {
        //faz algo com o erro retornado
    }
)
```

### Licença

[MIT License](https://github.com/leojaimesson/MIT-License)
