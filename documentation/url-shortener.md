### **Feature Title**
URL Shortener
***
### **Version**
2025-10-07 07:36:20 UTC
***
### **Summary**
This feature allows an anonymous user to submit a long URL and receive a system-generated, unique, short version of that URL. Every time a URL is submitted, a brand new, unique short URL is created, even if the same long URL has been submitted before. The system will store the mapping between the long and short URLs, and anyone visiting the short URL will be permanently redirected to the original long URL.
***
### **User Problem**
Users need to share long, complex URLs in places with character limits (like social media) or in a more aesthetically pleasing way. Long URLs are difficult to remember, type, and share.
***
### **Acceptance Criteria**
a. An anonymous user can create a unique short URL for each submission.
    - [ ] The user must provide a long URL to be shortened.
        - [ ] The long URL must be a valid URL syntax (e.g., starting with `http://` or `https://`).
        - [ ] The long URL must not exceed 2,048 characters to ensure broad compatibility.
        - [ ] If the user submits an invalid URL, the system must return the error message: "Wrong url format".
    - [ ] The system automatically generates a new, unique short URL for every single submission.
        - [ ] The generated unique path must be at least 8 characters long.
        - [ ] The path must contain only lowercase letters and numbers, making it case-insensitive.
        - [ ] The final short URL will be in the format: `domain/[unique-path]`.
    - [ ] The system must guarantee that every generated short URL is unique.
        - [ ] If the generation algorithm produces a short URL that already exists, a system exception must be thrown and the user should be shown the message: "An unexpected error occurred, please try again".
    - [ ] The system stores the association between the long and short URL in a key-value database.
b. The short URL is functional.
    - [ ] Accessing the generated short URL redirects the visitor to the original long URL using a permanent 301 redirect.
***
### **Out of Scope**
*   User-provided custom short URLs.
*   Returning a pre-existing short URL if a long URL is submitted more than once.
*   Reserved paths (e.g., /admin, /login).
*   Analytics or tracking of URL clicks.
*   User accounts for managing links.
*   Editing or deleting short URLs after creation.
*   Setting an expiration date for short URLs.
***
### **Dictionary**
| Term | Definition |
| :--- | :--- |
| URL | A standard web address with valid syntax (e.g., starting with `http://` or `https://`), not exceeding 2,048 characters. |
| Short URL | A short, unique identifier that redirects to a longer URL. |
| User | An anonymous visitor to the application; no sign-in is required. |
| Key-Value Database | A database that stores data as a collection of key-value pairs, used here to ensure short URLs are unique. |
***
### **Structure**
[ ] An anonymous user can create a unique short URL for each submission.
[ ] The user must provide a long URL to be shortened.
[ ] The long URL must be a valid URL syntax (e.g., starting with `http://` or `https://`).
[ ] The long URL must not exceed 2,048 characters to ensure broad compatibility.
[ ] If the user submits an invalid URL, the system must return the error message: "Wrong url format".
[ ] The system automatically generates a new, unique short URL for every single submission.
[ ] The generated unique path must be at least 8 characters long.
[ ] The path must contain only lowercase letters and numbers, making it case-insensitive.
[ ] The final short URL will be in the format: `domain/[unique-path]`.
[ ] The system must guarantee that every generated short URL is unique.
[ ] If the generation algorithm produces a short URL that already exists, a system exception must be thrown and the user should be shown the message: "An unexpected error occurred, please try again".
[ ] The system stores the association between the long and short URL in a key-value database.
[ ] The short URL is functional.
[ ] Accessing the generated short URL redirects the visitor to the original long URL using a permanent 301 redirect.
