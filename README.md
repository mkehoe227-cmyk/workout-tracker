# Workout Tracker

A strength-focused mobile workout tracking app built with React Native and Expo. Supports multiple user accounts, each with their own workout plans containing exercises (sets, reps, weight, and photos). Progress is tracked over time with charts and personal records. Designed for iPhone via Expo Go with Firebase as the backend.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo Go](https://expo.dev/go) installed on your iPhone
- A [Firebase](https://console.firebase.google.com/) project with Auth, Firestore, and Storage enabled

```
node --version
```

### Installing

Clone the repository

```
git clone https://github.com/mkehoe227-cmyk/workout-tracker.git
cd workout-tracker
```

Install dependencies

```
npm install
```

Copy the environment variable template and fill in your Firebase credentials

```
cp .env.example .env
```

Open `.env` and replace each placeholder with the values from your Firebase project settings:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Start the development server

```
npx expo start --clear
```

Scan the QR code with your iPhone Camera app to open the app in Expo Go.

## Running the tests

### Type checking

The project uses TypeScript. Run the type checker to validate the codebase:

```
npx tsc --noEmit
```

### Coding style tests

Ensure no TypeScript errors are introduced before committing:

```
npx tsc --noEmit
```

## Deployment

For development, use Expo Go by running `npx expo start` and scanning the QR code.

For production builds targeting the App Store, use [EAS Build](https://docs.expo.dev/build/introduction/):

```
npx eas build --platform ios
```

## Built With

* [Expo](https://expo.dev/) SDK 54 - React Native development platform
* [React Native](https://reactnative.dev/) - Cross-platform mobile framework
* [Firebase](https://firebase.google.com/) - Authentication, Firestore database, and Storage
* [React Navigation](https://reactnavigation.org/) v7 - Navigation library
* [TypeScript](https://www.typescriptlang.org/) - Type safety

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/mkehoe227-cmyk/workout-tracker/tags).

## Authors

* **mkehoe227-cmyk** - *Initial work* - [mkehoe227-cmyk](https://github.com/mkehoe227-cmyk)

See also the list of [contributors](https://github.com/mkehoe227-cmyk/workout-tracker/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Built with [Expo](https://expo.dev/) and [Firebase](https://firebase.google.com/)
* Navigation powered by [React Navigation](https://reactnavigation.org/)
