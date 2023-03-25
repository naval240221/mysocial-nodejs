# mysocial-nodejs
This simple Node.JS app with Sharing Post, adding comments and maintain a todo list

# Quick-Start Guide
This is quick start guide to setup and run the mysocial app

# Pre-requisite
- Install Node.Js v18.15.0
- Install MongoDB v6.0.5
- You should have postman installed to test api endpoints

# Setup
- Clone the repo
- Go to folder `mysocial-nodejs` and run command `npm install` to install all dependencies
- `npm run test` from this directory
- Your server should be running on `http://localhost:8080`

# To Run the tests
- Go to the folder `mysocial-nodejs`
- Run command `npm test`
- Should pass all the tests

# Api Method Description

### `POST /user`
Create a new user, Password should be minimum of 8 characters

#### request
```
{
  "firstname": "Naval",
  "lastname": "Kumawat"
  "email": "naval@mailinator.com",
  "password": "admin@123"
}
```

#### Response [200]
```
{
    "firstname": "Naval",
    "lastname": "Kumawat",
    "email": "naval5@mailinator.com",
    "__v": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiZmlyc3RuYW1lXCI6XCJOYXZhbFwiLFwibGFzdG5hbWVcIjpcIkt1bWF3YXRcIixcImVtYWlsXCI6XCJuYXZhbDVAbWFpbGluYXRvci5jb21cIixcIl9fdlwiOjAsXCJpZFwiOlwiNjQxZjEyMTIyOTVkMTlkMDJmZDZjNDc4XCJ9IiwiaWF0IjoxNjc5NzU3ODQzLCJleHAiOjE2Nzk3NTg0NDN9.3yyVFnGNMJTjZTu0rZcHTzsQM3HB9o9Wd-20b1tPskA",
    "id": "641f1212295d19d02fd6c478"
}
```

#### Response [400]
```
If one of these fields are missing email, firstname, lastname, password
Error Message: Please provide all the input details
```

### `POST /login`

Login at the platform

#### Request
```
{
  "email": "naval@mailinator.com",
  "password": "admin@123"
}
```

#### Response [200]
```
{
    "firstname": "Naval",
    "lastname": "Kumawat",
    "email": "naval@mailinator.com",
    "__v": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiZmlyc3RuYW1lXCI6XCJOYXZhbFwiLFwibGFzdG5hbWVcIjpcIkt1bWF3YXRcIixcImVtYWlsXCI6XCJuYXZhbDNAbWFpbGluYXRvci5jb21cIixcIl9fdlwiOjAsXCJpZFwiOlwiNjQxZWZmYWJiMmQwMmUwMzQyNTgwZWFmXCJ9IiwiaWF0IjoxNjc5NzU3OTQ4LCJleHAiOjE2Nzk3NTg1NDh9.K0JfRKyzur1X6NDI208i0xB86cpr6hbXKo8XQNrpEcI",
    "id": "641effabb2d02e0342580eaf"
}
```

#### Response [400]
If one of these fields are missing email, password
Error Message: Please provide all the input details

#### Response [404]
If password does not match
Error Message: Incorrect email or password

### `GET /user`

Get all users, Supports pagination and query params to filter users

#### Response [200]
```
{
  "users": [{
    "firstname": "Naval",
    "lastname": "Kumawat",
    "email": "naval5@mailinator.com",
    "__v": 0,
    "id": "641f1212295d19d02fd6c478"
  }],
  "total": 1
}
```

#### Response [404]
```
Error Message: "No user exists"
```

### `GET /user/:id`

Get a user details along with todos, posts

#### Response [200]
```
{
  "firstname": "Naval",
  "lastname": "Kumawat",
  "email": "naval5@mailinator.com",
  "__v": 0,
  "id": "641f1212295d19d02fd6c478",
  "posts": [],
  "todos": []
}
```

### `POST /todos`

Create a todo.

#### request
```
{
  "task": "Sample TODO Added"
}
```

#### Response [200]
```
{
   "id":"641f013db2d02e0342580eb7",
   "task":"Sample TODO Added",
   "user": "641efdf0e2509646d4eacd94",
   "completed": false,
   "__v":"0"
}
```

#### request2
```
{
  "text": "Sample Data"
}
```
#### Response [400]
```
Error Text: TODO can not be created with empty content

```

### `PUT /todos/:id`

Update a todo title/task, user who have created the todo only can perform this action

#### request
```
{
  "task": "Sample TODO Updated"
}
```

#### Response [200]
```
{
   "id":"641f013db2d0e0342580eb7",
   "task":"Sample TODO Updated",
   "user": "641efdf0e2509646d4eacd94",
   "completed": false,
   "__v":"0"
}

```

### `DELETE /todos/:id`

Delete a Todo, User who have created the todo will only be able to delete the todo

#### Response [200]
```
Todo deleted successfully

```

### `POST /todos/:id`

Mark a todo as completed succesfully, user who have created the todo only can mark it as completed

#### Response [200]
```
Task marked as completed successfully
```

### `GET /todos`

#### response [200]
```
{
  "tasks": [{
     "id":"641f013db2d0e0342580eb7",
     "task":"Sample TODO Updated",
     "user": {
        "firstname": "Naval",
        "lastname": "Kumawat",
        "email": "naval@mailinator.com"
     },
     "completed": false,
     "__v":"0"
  }],
  "totalCount": 1,
  "skip": 1
}
```

#### Available Query Params
```
skip: int,
limit: int,
sort: {'createdAt': 'desc'} // Object
user: string || Array
createdAt: {'$gte': "2023-03-22"}
completed: bool [true/false]
```

### `POST /posts`
Create post, only text is required

#### request
{
  "content": "Sample Post"
}

#### Response [200]
```
{
   "id":"641f013db2d02e0342580eb7",
   "content":"Sample Post Added",
   "user": "641efdf0e2509646d4eacd94",
   "comments": [],
   "__v":"0"
}
```

### `GET /posts`

Get Posts with latest 5 comments with each post. Supports pagination, Per page limit is 50, Every user can access to other user's post

#### Response [200]
```
{
  "posts": [{
     "id":"641f013db2d02e0342580eb7",
     "content":"Sample Post Added",
     "user": {
        "firstname": "Naval",
        "lastname": "Kumawat",
        "email": "naval@mailinator.com"
     },
     "comments": [],
     "__v":"0"
  }, {
     "id":"641f013db2d02e0342580eb7",
     "content":"Sample Post Added",
     "user": {
        "firstname": "Naval 1",
        "lastname": "Kumawat",
        "email": "naval2@mailinator.com"
     },
     "comments": [],
     "__v":"0"
  }],
  "skip": 2,
  "totalCount": 2
}
```
#### query params
```
skip: int,
limit: int,
sort: {'createdAt': 'desc'} // Object
user: string || Array
createdAt: {'$gte': "2023-03-22"}
```

### `PUT /posts/:id`
Update a post's content, user who have created the post only can perform this action

#### request
```
{
  "content": "Sample Post Updated"
}
```

#### Response [200]
```
{
   "id":"641f013db2d02e0342580eb7",
   "content":"Sample Post Updated",
   "user": "641efdf0e2509646d4eacd94",
   "comments": [],
   "__v":"0"
}
```

### `DELETE /posts/:id`

Delete a post, User who have created the post will only be able to delete the post

#### Response [200]
```
Post deleted successfully
```

### `GET /posts/:id`
Get a specific post along with comments, all comments sorted in asceding order

#### Response [200]
```
{
   "id":"641f013db2d02e0342580eb7",
   "content":"Sample Post Updated",
   "user": {
      "firstname": "Naval",
      "lastname": "Kumawat",
      "email": "naval@mailinator.com"
   },
   "comments": [],
   "__v":"0"
}
```

### `POST /posts/:id/comments`

Add comment to a post, any user can add comment to any post, only content is required

#### request
```
{
  "content": "Sample Comment Added"
}
```

#### Response [200]
```
{
   "id":"641f03b9c0ab28dbd2f603f1",
   "content": "Sample Comment Added",
   "post": "641f009eb2d02e0342580eb5",
   "addedBy": "641effabb2d02e0342580eaf",
   "__v": 0
}
```

### `DELETE /posts/:id/comments`

Delete a comment from a post, User can only delete comment added by themselves

#### Response [200]
```
Comment deleted successfully
```

#### Response [400]
```
You can delete only your added comments.
```

### `GET /posts/:id/comments`

Get all comments related to a post, Support query params can fetch comments added by a specific user

#### Response [200]
```
{
  "comments": [{
     "id":"641f03b9c0ab28dbd2f603f1",
     "content": "Sample Comment Added",
     "post": "641f009eb2d02e0342580eb5",
     "addedBy": {
        "firstname": "Naval",
        "lastname": "Kumawat",
        "email": "naval@mailinator.com"
     },
     "__v": 0
  }, {
     "id":"641f03b9c0ab28dbd2f603f1",
     "content": "Sample Comment Added New",
     "post": "641f009eb2d02e0342580eb5",
     "addedBy": {
        "firstname": "Naval 2",
        "lastname": "Kumawat",
        "email": "naval2@mailinator.com"
     },
     "__v": 0
  }],
  "skip": 2,
  "totalCount": 2
}
```
