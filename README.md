# File-Server-UI-Android

this is the android version of the [desktop file_server client](https://github.com/ploiu/file-server-ui) for my [file server](https://github.com/ploiu/file_server). It's still under development but I aim to bring all functionality to this app.

## Getting Started
The first thing you'll need is to make sure you have an instance of [file_server](https://github.com/ploiu/file_server) running...somewhere, preferably on your local machine. Import your ca.crt generated from the `gen_certs.sh` script in that project to the phone you're testing on.
The next thing you'll need is to follow the instructions located in `./assets/config.example.jsonc`. This is to set up app config

## Architecture
This is a react native application using expo. The style framework is react-native-paper, and it uses Jest for tests. 
