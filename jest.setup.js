require('react-native-reanimated').setUpTests();
const error = console.error;
globalThis.supressConsoleForAct = () => {
    globalThis.console.error = (...args) => {
    const isActLog = args.find(it => it.includes('not wrapped in act')) ?? false
    if(!isActLog) {
        error(args)
    }
    }
}

globalThis.restoreConsole = () => {
    globalThis.console.error = error
}