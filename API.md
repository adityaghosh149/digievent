# Digievent API Documentation

## Overview

This document provides an overview of all the available API endpoints for **Digievent**, a university event management platform. The APIs are divided into different sections based on user roles and functionality.

---

## Table of Contents

1. [SuperAdmin API](./src/docs/api-docs/superadmin.md)
2. [Admin API](./src/docs/api-docs/admin.md)
3. [Organizer API](./src/docs/api-docs/organizer.md)
4. [Student API](./src/docs/api-docs/student.md)
5. [Others API](./src/docs/api-docs/others.md)


---

## Error Handling & Response

### APIError

Custom error class extending JavaScript's `Error` for structured API errors.

#### Constructor:

```js
new APIError(statusCode, message, errors, stack)
```

* `statusCode`: HTTP status code (e.g., 400, 500)
* `message`: Error message (default: "⚠️ Something went wrong!!")
* `errors`: Array of error details (optional)
* `stack`: Custom stack trace (optional)

#### Example:

```js
throw new APIError(400, "Invalid input", ["Email required"]);
```

Response example:

```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "errors": ["Email required"],
  "stack": null
}
```

---

### APIResponse

Standard success response wrapper.

#### Constructor:

```js
new APIResponse(statusCode, data, message)
```

* `statusCode`: HTTP status code (e.g., 200)
* `data`: Response data
* `message`: Success message (default: "Success")

#### Example:

```js
res.status(200).json(new APIResponse(200, { id: 1, name: "Event 1" }));
```

Response example:

```json
{
  "statusCode": 200,
  "data": { 
    "id": 1, 
    "name": "Event 1" 
  },
  "message": "Success",
}
```