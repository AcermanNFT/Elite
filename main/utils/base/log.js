class Logger {

    backend(...messages) {
        console.log(`\x1b[37m[\x1b[35mBACKEND\x1b[0m\x1b[37m]`, ...messages);
    }

    debug(...messages) {
        console.log(`\x1b[37m[\x1b[36mDEBUG\x1b[0m\x1b[37m]`, ...messages);
    }

    auth(...messages) {
        console.log(`\x1b[37m[\x1b[31mAUTH\x1b[0m\x1b[37m]`, ...messages);
    }

    frontend(...messages) {
        console.log(`\x1b[37m[\x1b[35mFRONTEND\x1b[0m\x1b[37m]`, ...messages);
    }

}

module.exports = new Logger();