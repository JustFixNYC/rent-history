# Tests in Lambda

Note that multi key params are handled differently for REST vs HTTP and we're currently using HTTP. HTTP creates a single `queryStringParameters` value with comma separated values, and REST uses `multiValueQueryStringParameters`


test-multi-key-put
```{
  "queryStringParameters": {
    "method": "PUT",
    "key": "user1/page1.jpg,user1/page2.jpg,user1/page3.jpg"
  }
}
```


test-multi-key-get
```{
  "queryStringParameters": {
    "method": "GET",
    "key": "user1/page1.jpg,user1/page2.jpg,user1/page3.jpg"
  }
}
```

test-single-key-get
```{
  "queryStringParameters": {
    "method": "GET",
    "key": "user1/page1.jpg"
  }
}
```
