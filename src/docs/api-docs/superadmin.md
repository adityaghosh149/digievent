# SuperAdmin API Documentation

---

## **1. SuperAdmin Authentication and Profile Management**

### **1.1 Register SuperAdmin**

* **Method:** `POST`
* **Endpoint:** `/register`
* **Description:** Registers a new SuperAdmin.
* **Auth Requirement:** None
* **Roles Allowed:** None
* **Request Body:**

  ```json
  {
    "email": "superadmin@example.com",
    "password": "strongpassword",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }
  ```
* **Response:**

  * **Status:** `201 Created`

  ```json
  {
    "statusCode": 201,
    "data": { /* SuperAdmin Object excluding password & refreshToken */ },
    "message": "✅ SuperAdmin registered successfully"
  }
  ```

---

### **1.2 Login SuperAdmin**

* **Method:** `POST`
* **Endpoint:** `/login`
* **Description:** Logs in the SuperAdmin and generates access & refresh tokens.
* **Auth Requirement:** None
* **Roles Allowed:** None
* **Request Body:**

  ```json
  {
    "email": "superadmin@example.com",
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

### **1.3 Logout SuperAdmin**

* **Method:** `POST`
* **Endpoint:** `/logout`
* **Description:** Logs out the SuperAdmin by invalidating the refresh token.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
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

### **1.4 Get SuperAdmin Profile**

* **Method:** `GET`
* **Endpoint:** `/profile`
* **Description:** Retrieves the authenticated SuperAdmin's profile.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* SuperAdmin Profile excluding password & refreshToken */ },
    "message": "✅ SuperAdmin profile fetched successfully"
  }
  ```

---

### **1.5 Update SuperAdmin Profile**

* **Method:** `PUT`
* **Endpoint:** `/profile`
* **Description:** Updates the authenticated SuperAdmin's profile (name, phone, avatar, etc.).
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Request Body:**

  ```json
  {
    "name": "Updated Name",
    "phoneNumber": "+1234567891",
    "avatar": "image_url" // Optional if you want to update avatar
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated SuperAdmin Profile */ },
    "message": "✅ SuperAdmin profile updated successfully"
  }
  ```

---

### **1.6 Delete SuperAdmin (Root Only)**

* **Method:** `DELETE`
* **Endpoint:** `/delete/:superAdminId`
* **Description:** Soft deletes a SuperAdmin (Only Root SuperAdmin can delete).
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** Root SuperAdmin only
* **Request Params:**

  ```json
  {
    "superAdminId": "SUPER_ADMIN_ID"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": null,
    "message": "✅ SuperAdmin soft deleted successfully"
  }
  ```

---

### **2. Admin Management**

### **2.1 Register Admin**

* **Method:** `POST`
* **Endpoint:** `/admin/register`
* **Description:** Registers a new Admin under a SuperAdmin.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** Root SuperAdmin only
* **Request Body:**

  ```json
  {
    "superAdminId": "SUPER_ADMIN_ID",
    "universityName": "University Name",
    "email": "admin@university.com",
    "phoneNumber": "+1234567890",
    "password": "strongpassword",
    "city": "City Name",
    "state": "State Name"
  }
  ```
* **Response:**

  * **Status:** `201 Created`

  ```json
  {
    "statusCode": 201,
    "data": { /* Admin Object excluding password & refreshToken */ },
    "message": "✅ Admin registered successfully"
  }
  ```

---

### **2.2 Update Admin Profile**

* **Method:** `PUT`
* **Endpoint:** `/admin/update/:adminId`
* **Description:** Updates Admin profile details (phone, university name, etc.).
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Request Params:**

  ```json
  {
    "adminId": "ADMIN_ID"
  }
  ```
* **Request Body:**

  ```json
  {
    "universityName": "Updated University",
    "email": "updated@university.com",
    "phoneNumber": "+1234567891",
    "city": "New City",
    "state": "New State"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated Admin Object */ },
    "message": "✅ Admin profile updated successfully"
  }
  ```

---

### **2.3 Suspend Admin**

* **Method:** `PUT`
* **Endpoint:** `/admin/suspend/:adminId`
* **Description:** Suspends an Admin account.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Request Params:**

  ```json
  {
    "adminId": "ADMIN_ID"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Suspended Admin Object */ },
    "message": "✅ Admin account suspended successfully"
  }
  ```

---

### **2.4 Reactivate Admin**

* **Method:** `PUT`
* **Endpoint:** `/admin/reactivate/:adminId`
* **Description:** Reactivates a suspended Admin account.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Request Params:**

  ```json
  {
    "adminId": "ADMIN_ID"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Reactivated Admin Object */ },
    "message": "✅ Admin account reactivated successfully"
  }
  ```

---

### **3. Help Requests**

### **3.1 Get All Help Requests**

* **Method:** `GET`
* **Endpoint:** `/help-requests`
* **Description:** Retrieves all help requests with associated admin details.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": "HELP_REQUEST_ID",
        "subject": "Request Subject",
        "body": "Request Details",
        "status": "Unread",
        "receivedTime": "2025-05-07T12:00:00.000Z",
        "admin": {
          "universityName": "University Name",
          "email": "admin@university.com",
          "city": "City",
          "state": "State"
        }
      }
    ],
    "message": "✅ Help requests fetched successfully"
  }
  ```

---

### **3.2 Mark Help Request as Read**

* **Method:** `PUT`
* **Endpoint:** `/help-request/read/:helpRequestId`
* **Description:** Marks a specific help request as read.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Request Params:**

  ```json
  {
    "helpRequestId": "HELP_REQUEST_ID"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated HelpRequest Object */ },
    "message": "✅ Help request marked as read"
  }
  ```

---

### **3.3 Mark Help Request as Resolved**

* **Method:** `PUT`
* **Endpoint:** `/help-request/resolved/:helpRequestId`
* **Description:** Marks a specific help request as resolved.
* **Auth Requirement:** Bearer Token
* **Roles Allowed:** SuperAdmin
* **Request Params:**

  ```json
  {
    "helpRequestId": "HELP_REQUEST_ID"
  }
  ```
* **Response:**

  * **Status:** `200 OK`

  ```json
  {
    "statusCode": 200,
    "data": { /* Updated HelpRequest Object */ },
    "message": "✅ Help request marked as resolved"
  }
  ```

---

## **Errors**

* **401 Unauthorized**: Missing or invalid token
* **403 Forbidden**: Access denied due to insufficient privileges
* **404 Not Found**: Resource not found (e.g., SuperAdmin or Admin not found)
* **500 Internal Server Error**: Unexpected errors (e.g., database issues)

---