# LeoAlfaroWorkOrders


## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running

When you already have all the repo do npm install
Then just do npm run start to lauch the app to the por 4200


The most tricky part was to print the work order bars in right place. Work orders are filtered by work center, then each item is converted into a display model with start/end dates, left offset, and width based on the current timeline scale. The list is sorted by start date and only items within the visible time window are rendered.
