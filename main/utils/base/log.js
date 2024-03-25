class Logger {

    backend(...messages) {
        console.log(`\x1b[37m[\x1b[35mBACKEND\x1b[0m\x1b[37m]`, ...messages);
    }

    debug(...messages) {
        console.log(`\x1b[37m[\x1b[36mDebug\x1b[0m\x1b[37m]`, ...messages);
    }

    auth(...messages) {
        console.log(`\x1b[37m[\x1b[31mWEBSITE\x1b[0m\x1b[37m]`, ...messages);
    }

}

module.exports = new Logger();