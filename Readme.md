# Agrivision API

API to power the Agrivision project.

## **Contribution Guidelines**
-   Do not push directly to this repository.<br>
-   Please create a pull request, even if you have edit access.<br>
-   Do not leak your API keys.
-   Do not use the API for anything other than the Agrivision project.
-   Create a different branch for each feature/bugfix.
-   Always lint your code before pushing. To do this, run `npm run lint` in the root directory.

## Before you start

-   **Learn Postman**
    -   Learn how to use Postman to test your API calls.
    -   [Postman](https://www.getpostman.com/) is a great tool to test your API calls.

-   Learn to use winston logger. You can use winston instead of `console.log()` to log and debug your API.

## **Setting up local Development Environment**
-   Fork this repository. ([agri-api](https://github.com/AgriVision4U/agri-api))
-   Clone your fork locally.
-   Add upstream as a remote.
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
