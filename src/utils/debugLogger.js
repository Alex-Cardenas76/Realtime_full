const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
};

const styles = {
    INFO: 'color: #3b82f6; font-weight: bold;',
    WARN: 'color: #f59e0b; font-weight: bold;',
    ERROR: 'color: #ef4444; font-weight: bold;',
    DEBUG: 'color: #10b981; font-weight: bold;',
};

class DebugLogger {
    constructor(namespace = 'App') {
        this.namespace = namespace;
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.namespace}] [${level}]`;

        if (data) {
            console.groupCollapsed(`%c${prefix} ${message}`, styles[level]);
            console.log('Details:', data);
            console.trace('Stack Trace');
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${message}`, styles[level]);
        }
    }

    info(message, data) {
        this.log(LOG_LEVELS.INFO, message, data);
    }

    warn(message, data) {
        this.log(LOG_LEVELS.WARN, message, data);
    }

    error(message, error) {
        this.log(LOG_LEVELS.ERROR, message, error);
    }

    debug(message, data) {
        // Only log debug in development
        if (import.meta.env.DEV) {
            this.log(LOG_LEVELS.DEBUG, message, data);
        }
    }
}

export const logger = new DebugLogger('RealtimeAuth');
export const roomLogger = new DebugLogger('RoomService');
export const authLogger = new DebugLogger('AuthService');
