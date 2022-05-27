
# Creating a Post via API

> _Assuming your control panel is available at `control-panel.internal.example` on 80/443_

## Authentication

Getting an API token is pretty straight-forward, just send a `POST` request with user credentials in the body, and the server will send back an access token.

```http
POST /api/token HTTP/1.1
host: control-panel.internal.example
content-type: application/json

{ "username": "<username>", "password": "<password>" }
```

#### Example Response

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
etag: "..."

{
  "token": "<access_token>",
  "payload": {
    "iss": "http://control-panel.internal.example",
    "sub": "<username>",
    "aud": [
      "http://www.your-blog.example",
      "http://control-panel.internal.example"
    ],
    "exp": 1653280870,
    "iat": 1653270070,
    "roles": {
      "admin": true
    }
  }
}
```

On future requests, you'll supply the access token using an `Authorization` header, for example:

```http
GET /api/posts HTTP/1.1
host: control-panel.internal.example
authorization: Bearer <access_token>
```

## Snowflake ID

If you want to use a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) for the new post's URL, you can request one from the server like this:

```http
GET /api/snowflake HTTP/1.1
host: control-panel.internal.example
authorization: Bearer <access_token>
```

The server will send back the new ID. _Note: this does not actually create or store any kind of resource, or assign any meaning to this new ID._

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
etag: "..."

{ "snowflake": "316395581670968236" }
```

## Creating the Post

```http
POST /api/posts HTTP/1.1
host: control-panel.internal.example
content-type: application/json
authorization: Bearer <access_token>

{
  "post_type": "post",
  "uri_name": "your-new-post-title",
  "title": "Your New Post Title",
  "subtitle": "Sub-Title",
  "content_markdown": "This is the actual content for the post",
  "is_draft": true,
  "tags": [ "testing" ]
}
```

#### Example Response

```http
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8
etag: "..."
location: http://control-panel.internal.example/api/posts/your-new-post-title

{
  "post_type": "post",
  "uri_name": "your-new-post-title",
  "title": "Your New Post Title",
  "subtitle": "Sub-Title",
  "external_url": "",
  "content_html": "<p>This is the actual content for the post</p>\n",
  "content_markdown": "This is the actual content for the post",
  "image": "",
  "banner_image": "",
  "is_draft": true,
  "date_published": "",
  "date_updated": "",
  "tags": [ "testing" ]
}
```
