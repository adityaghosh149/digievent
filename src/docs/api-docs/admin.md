## Admin APIs

---

## **1. Admin Authentication and Profile Management**

### **1.1 Login Admin**

* **Method:** `POST`
* **Endpoint:** `/login`
* **Description:** Logs in the admin and generates access & refresh tokens.
* **Auth Requirement:** None
* **Roles Allowed:** None
* **Request Body:**

  ```json
  {
    "email": "admin@example.com",
    "password": "strongpassword"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": {
      "accessToken": "JWT_ACCESS_TOKEN",
      "refreshToken": "JWT_REFRESH_TOKEN"
    },
    "message": "✅ Login successful"
  }
  ```

---

### **1.2 Logout Admin**

* **Method:** `POST`
* **Endpoint:** `/logout`
* **Description:** Logs out the admin and invalidates the access token.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:** None
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": null,
    "message": "✅ Logout successful"
  }
  ```

---

### **1.3 Update Admin Profile**

* **Method:** `PATCH`
* **Endpoint:** `/update`
* **Description:** Updates the admin profile. Optionally, update the avatar.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "name": "Updated Name",
    "phoneNumber": "+9876543210",
    "avatar": "image-file"  // Optional, only if the avatar is being updated
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated Admin Object excluding password & refreshToken */ },
    "message": "✅ Admin profile updated successfully"
  }
  ```

---

### **1.4 Refresh Admin Token**

* **Method:** `POST`
* **Endpoint:** `/refresh-token`
* **Description:** Refreshes the admin's access token using the refresh token.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "refreshToken": "JWT_REFRESH_TOKEN"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": {
      "accessToken": "NEW_JWT_ACCESS_TOKEN"
    },
    "message": "✅ Token refreshed successfully"
  }
  ```

---

## **2. Organizer Management**

### **2.1 Get All Organizers**

* **Method:** `GET`
* **Endpoint:** `/organizers`
* **Description:** Retrieves a list of all organizers under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:** None
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": [{ /* Array of Organizer objects excluding sensitive fields */ }],
    "message": "✅ All organizers for this admin retrieved successfully"
  }
  ```

---

### **2.2 Register Organizer**

* **Method:** `POST`
* **Endpoint:** `/organizer/register`
* **Description:** Registers a new organizer under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "organizerName": "John Doe",
    "clubName": "Tech Club",
    "email": "organizer@example.com",
    "phoneNumber": "+1234567890",
    "password": "strongpassword",
    "avatar": "image-file"  // Optional, only if an avatar is uploaded
  }
  ```
* **Response:**

  * **Status:** `201 Created`

  ```json
  {
    "statusCode": 201,
    "data": { /* Created Organizer Object excluding password & refreshToken */ },
    "message": "🎉 Organizer registered successfully!"
  }
  ```

---

### **2.3 Update Organizer**

* **Method:** `PATCH`
* **Endpoint:** `/organizer/update/:organizerId`
* **Description:** Updates an existing organizer's details under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "organizerName": "Updated Name",
    "clubName": "Updated Club Name",
    "phoneNumber": "+9876543210",
    "avatar": "image-file"  // Optional, only if the avatar is updated
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated Organizer Object excluding password & refreshToken */ },
    "message": "✅ Organizer profile updated successfully"
  }
  ```

---

## **3. Course Management**

### **3.1 Get All Courses**

* **Method:** `GET`
* **Endpoint:** `/courses`
* **Description:** Retrieves a list of all courses under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:** None
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": [{ /* Array of Course objects */ }],
    "message": "✅ Courses fetched successfully"
  }
  ```

---

### **3.2 Add New Course**

* **Method:** `POST`
* **Endpoint:** `/course/add-course`
* **Description:** Adds a new course under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "courseName": "Computer Science",
    "duration": 4
  }
  ```
* **Response:**

  * **Status:** `201 Created`

  ```json
  {
    "statusCode": 201,
    "data": { /* Created Course Object */ },
    "message": "🎉 Course added successfully"
  }
  ```

---

### **3.3 Update Course**

* **Method:** `PATCH`
* **Endpoint:** `/course/update/:courseId`
* **Description:** Updates an existing course under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "courseName": "Updated Course Name",
    "duration": 5
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated Course Object */ },
    "message": "✏️ Course updated successfully"
  }
  ```

---

## **4. Student Management**

### **4.1 Register Student**

* **Method:** `POST`
* **Endpoint:** `/student/register`
* **Description:** Registers a new student under the admin.
* **Auth Requirement:** `verifyJWT`, `requireAdmin`
* **Roles Allowed:** Admin
* **Request Body:**

  ```json
  {
    "name": "Student Name",
    "rollNumber": "12345",
    "email": "student@example.com",
    "phoneNumber": "+9876543210",
    "password": "strongpassword",
    "stream": "Computer Science",
    "section": "A",
    "semester": 2,
    "year": 2025,
    "currentYear": 2025,
    "courses": ["Course1", "Course2"],
    "avatar": "image-file"  // Optional, only if an avatar is uploaded
  }
  ```
* **Response:**

  * **Status:** `201 Created`

  ```json
  {
    "statusCode": 201,
    "data": { /* Created Student Object excluding password & refreshToken */ },
    "message": "🎓 Student registered successfully!"
  }
  ```

---

## **Errors**

* **401 Unauthorized**: Missing or invalid token
* **403 Forbidden**: Access denied due to insufficient privileges
* **404 Not Found**: Resource not found (e.g., Organizer, Course, Student not found)
* **409 Conflict**: Duplicate data found (e.g., existing email, phone number, roll number)
* **422 Unprocessable Entity**: Validation error (e.g., invalid email, phone number, or password)
* **500 Internal Server Error**: Unexpected errors (e.g., Cloudinary upload failure, database issues)

---


