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

# Api Endpoints

## Signup
```
Method: POST
Api-Enpoint: /user
Sample Payload
{
  "firstname": "Naval",
  "lastname": "Kumawat"
  "email": "naval@mailinator.com",
  "password": "admin@123"
}

Response [200]:
{
    "firstname": "Naval",
    "lastname": "Kumawat",
    "email": "naval5@mailinator.com",
    "__v": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiZmlyc3RuYW1lXCI6XCJOYXZhbFwiLFwibGFzdG5hbWVcIjpcIkt1bWF3YXRcIixcImVtYWlsXCI6XCJuYXZhbDVAbWFpbGluYXRvci5jb21cIixcIl9fdlwiOjAsXCJpZFwiOlwiNjQxZjEyMTIyOTVkMTlkMDJmZDZjNDc4XCJ9IiwiaWF0IjoxNjc5NzU3ODQzLCJleHAiOjE2Nzk3NTg0NDN9.3yyVFnGNMJTjZTu0rZcHTzsQM3HB9o9Wd-20b1tPskA",
    "id": "641f1212295d19d02fd6c478"
}

Response [400]
If one of these fields are missing email, firstname, lastname, password
Error Message: Please provide all the input details

Response [409]
If already exist a user with the same email
Error Message: User already exist. Please proceed with login.

```

## Login
```
Method: POST
Api-Enpoint: /login
Sample Payload
{
  "email": "naval@mailinator.com",
  "password": "admin@123"
}

Response [200]
{
    "firstname": "Naval",
    "lastname": "Kumawat",
    "email": "naval@mailinator.com",
    "__v": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiZmlyc3RuYW1lXCI6XCJOYXZhbFwiLFwibGFzdG5hbWVcIjpcIkt1bWF3YXRcIixcImVtYWlsXCI6XCJuYXZhbDNAbWFpbGluYXRvci5jb21cIixcIl9fdlwiOjAsXCJpZFwiOlwiNjQxZWZmYWJiMmQwMmUwMzQyNTgwZWFmXCJ9IiwiaWF0IjoxNjc5NzU3OTQ4LCJleHAiOjE2Nzk3NTg1NDh9.K0JfRKyzur1X6NDI208i0xB86cpr6hbXKo8XQNrpEcI",
    "id": "641effabb2d02e0342580eaf"
}

Response [400]
If one of these fields are missing email, password
Error Message: Please provide all the input details

Response [404]
If password does not match
Error Message: Incorrect email or password

```

## Get Users
```
Method: GET
Api-Enpoint: /user

Response [200]:
Response Body = {
  "users": [{
    "firstname": "Naval",
    "lastname": "Kumawat",
    "email": "naval5@mailinator.com",
    "__v": 0,
    "id": "641f1212295d19d02fd6c478"
  }],
  "total": 1
}

Response [404]:
Error Message: "No user exists"
```

## Get User Details
```
Method: GET
Api-Endpoint: /user/:id

Response [200]:
Response Body = {
  "firstname": "Naval",
  "lastname": "Kumawat",
  "email": "naval5@mailinator.com",
  "__v": 0,
  "id": "641f1212295d19d02fd6c478",
  "posts": [],
  "todos": []
}
```

## Create A ToDo
```
Method: POST
Api-Enpoint: /todos
Sample Payload
{
  "task": "Sample TODO Added"
}

Response [200]
Sample Response
{
   "id":"641f013db2d02e0342580eb7",
   "task":"Sample TODO Added",
   "user": "641efdf0e2509646d4eacd94",
   "completed": false,
   "__v":"0"
}

Sample Payload 2
{
  "text": "Sample Data"
}
Response [400]
Error Text: TODO can not be created with empty content

```

## Update a TODO
```
Method: PUT
Api-Enpoint: /todos/:id
Sample Payload
{
  "task": "Sample TODO Updated"
}

Response [200]
Sample Response
{
   "id":"641f013db2d0e0342580eb7",
   "task":"Sample TODO Updated",
   "user": "641efdf0e2509646d4eacd94",
   "completed": false,
   "__v":"0"
}

```

## Delete a TODO
```
Method: Delete
Api-Enpoint: /todos/:id

Response [200]
Sample Response
Todo deleted successfully

```

## Mark TODO As Complete
```
Method: POST
Api-Enpoint: /todos/:id

Response [200]
Sample Response
"Task marked as completed successfully"

```
