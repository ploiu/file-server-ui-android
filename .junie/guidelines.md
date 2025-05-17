# Build Instructions
- use `npm start` to run

# Testing Information
- each function should get its own test file inside a `__tests__` folder in the parent folder of the function. For example, a function named `whatever` in `./util/misc.ts` should have tests located in `./util/__tests__/whatever.test.ts`

# Additional Information
- this app depends on a separate project to be running on port 8000
- server spec is located in `.junie/openapi.json`
- this app uses ssl pinning. The pinning is done in a wrapper method named `apiFetch` located in `Config.ts`. `apiFetch` should always be used instead of `fetch`
- 

# Architecture
- react native application using expo. _Only_ for android, no ios support
- material design using `react-native-paper`
- client api calls should use the caching functions in `util/cacheUtil.ts`. Each cache "type" gets its own class, though all cached items are in the same cache db
- you may be tempted to look at ApiClient.ts for how the api works, but that file is specifically for server metadata routes, such as version and passwords
- file previews are cached, but files themselves should be "cached" by saving the actual file off in a folder only accessible to the application.
- cache should always be checked _first_ before making api calls
- any action that modifies data should delete the cache for the data modified
- this ***DOES NOT USE NODE*** for the runtime, so node-specific language extensions will not work.

# Folder Structure
- `app` contains all ui components, layout, etc
  - `app/files` contains ui pages specifically for files
  - `app/folders` contains ui pages specifically for folders
  - `app/components` contains reusable components
- `app-example` should be ***COMPLETELY IGNORED*** and is unused
- `assets` contains font and image information
- `client` contains information based on `.junie/openapi.json` to make calls to the backend server
- `util` contains miscellaneous reusable functions
- `models.ts` contains models based on `.junie/openapi.json`
- `Config.ts` contains functions for parsing out the app config file (located in `assets/config.json`, that file should ***NEVER BE TOUCHED***)
