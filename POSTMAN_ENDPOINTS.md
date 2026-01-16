# Postman Collection - Updated Auth Endpoints

## Quick Setup

1. Open Postman
2. Import the updated `Academic-Leave-Portal.postman_collection.json`
3. Set environment variable: `{{base_url}}` = `http://localhost:5000/api`
4. Set environment variable: `{{token}}` = (will be auto-set after login)

---

## Authentication Endpoints

### 1. Login (Get Token)
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "department": null,
      "leaveBalance": 20
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Script** (auto-save token):
```javascript
if (pm.response.code === 200) {
  let jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
}
```

---

### 2. Get Current User (/me)
```http
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

---

### 3. Logout
```http
POST {{base_url}}/auth/logout
Authorization: Bearer {{token}}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## User Management Endpoints (Admin Only)

### 4. Create Student
```http
POST {{base_url}}/auth/create-student
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "John Student",
  "email": "john.student@example.com",
  "password": "student123",
  "department": "Computer Science"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Student",
      "email": "john.student@example.com",
      "role": "student",
      "department": "Computer Science",
      "leaveBalance": 20
    }
  }
}
```

**Error (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Access denied. This action requires admin role.",
  "data": null
}
```

**Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Please provide name, email, and password",
  "data": null
}
```

---

### 5. Create Admin
```http
POST {{base_url}}/auth/create-admin
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Jane Admin",
  "email": "jane.admin@example.com",
  "password": "admin123"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Jane Admin",
      "email": "jane.admin@example.com",
      "role": "admin"
    }
  }
}
```

**Error (403 Forbidden)**:
```json
{
  "success": false,
  "message": "Access denied. This action requires admin role.",
  "data": null
}
```

---

## Testing Workflow in Postman

### Workflow 1: Admin Creates Student

1. **Step 1**: Login as Admin
   - POST `/auth/login` with admin credentials
   - Token auto-saved to `{{token}}`

2. **Step 2**: Create a Student
   - POST `/auth/create-student` with student details
   - Should return 201 with new student data

3. **Step 3**: Logout (optional)
   - POST `/auth/logout`

4. **Step 4**: Login as Student
   - POST `/auth/login` with student email/password
   - Get new token for student account

5. **Step 5**: Access Student Resource
   - GET `/auth/me` with student token
   - Should show student role and data

---

### Workflow 2: Session Persistence

1. **Step 1**: Login
   - POST `/auth/login` with any credentials
   - Save token

2. **Step 2**: Get Current User
   - GET `/auth/me` with token
   - Should return user data

3. **Step 3**: Simulate Token Expiration
   - Manually clear `{{token}}` variable
   - Try GET `/auth/me`
   - Should get 401 Unauthorized

---

## Error Responses

### 401 Unauthorized (Invalid/Missing Token)
```json
{
  "success": false,
  "message": "Not authorized, no token provided",
  "data": null
}
```

### 401 Unauthorized (Token Expired)
```json
{
  "success": false,
  "message": "Not authorized, token invalid or expired",
  "data": null
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "success": false,
  "message": "Access denied. This action requires admin role.",
  "data": null
}
```

### 400 Bad Request (Duplicate Email)
```json
{
  "success": false,
  "message": "User with this email already exists",
  "data": null
}
```

---

## Updated Postman Collection JSON

Replace your `Academic-Leave-Portal.postman_collection.json` with the structure below:

```json
{
  "info": {
    "name": "Academic Leave Portal - Auth Redesigned",
    "description": "API collection for institution-style authentication",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"admin@example.com\", \"password\": \"admin123\"}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "  let jsonData = pm.response.json();",
                  "  pm.environment.set('token', jsonData.data.token);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Get Current User",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/auth/me",
              "host": ["{{base_url}}"],
              "path": ["auth", "me"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/auth/logout",
              "host": ["{{base_url}}"],
              "path": ["auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "User Management (Admin Only)",
      "item": [
        {
          "name": "Create Student",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\": \"John Student\", \"email\": \"john@example.com\", \"password\": \"student123\", \"department\": \"Computer Science\"}"
            },
            "url": {
              "raw": "{{base_url}}/auth/create-student",
              "host": ["{{base_url}}"],
              "path": ["auth", "create-student"]
            }
          }
        },
        {
          "name": "Create Admin",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\": \"Jane Admin\", \"email\": \"jane@example.com\", \"password\": \"admin123\"}"
            },
            "url": {
              "raw": "{{base_url}}/auth/create-admin",
              "host": ["{{base_url}}"],
              "path": ["auth", "create-admin"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Key Changes from Previous Design

| Feature | Before | After |
|---------|--------|-------|
| Public Signup | ✅ Yes | ❌ No |
| Public /register endpoint | ✅ Yes | ❌ Removed |
| Role selector in UI | ✅ Yes | ❌ No |
| Signup tab | ✅ Yes | ❌ No |
| Admin creates users | ❌ No | ✅ Yes |
| Role determined by | Frontend select | Backend response |
| Create student endpoint | ❌ Missing | ✅ `/auth/create-student` |
| Create admin endpoint | ❌ Missing | ✅ `/auth/create-admin` |

---

## Notes

- All endpoints use JWT Bearer token authentication (except login)
- Role validation happens at both middleware and database level
- No user can fake their role by changing UI
- Token is persistent across requests and page refreshes
- Invalid/expired tokens are automatically cleared and redirect to login
