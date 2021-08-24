# Agrivision API

API to power the Agrivision project.

#### **API documentation is available at [https://github.com/AgriVision4U/api-docs](https://github.com/AgriVision4U/api-docs).**
## **Contribution Guidelines**
-   Do not push directly to this repository.<br>
-   Please create a pull request, even if you have edit access.<br>
-   Do not leak your API keys.
-   Do not use the API for anything other than the Agrivision project.
-   Create a different branch for each feature/bugfix.
-   To maintain code style uniformity, always lint your code before pushing. To do this, run `npm run format` in the root directory.

## Before you start

-   **Learn Postman**
    -   Learn how to use Postman to test your API calls.
    -   [Postman](https://www.getpostman.com/) is a great tool to test your API calls.

-   Learn to use winston logger. You can use winston instead of `console.log()` to log and debug your API.

## Learning Resources

- [What is REST API](https://restfulapi.net/)
- [REST API Design Best Practices](https://medium.com/hashmapinc/rest-good-practices-for-api-design-881439796dc9)
- [Versioning REST APIs](https://www.freecodecamp.org/news/how-to-version-a-rest-api/)
## **Setting up local Development Environment**
-   Fork this repository. ([agri-api](https://github.com/AgriVision4U/agri-api))
-   Clone your fork locally.
-   Add upstream as a remote.
```
git remote add upstream git://github.com/AgriVision4U/agri-api.git
```
-   Install dependencies.

```
npm install
```

-   Configure Enviornment Variables.

Run the development server.

```
npm run dev
```

or

```
node -r dotenv/config src/index.js
```

To run development server with live reload.

```
npm run devc
```
