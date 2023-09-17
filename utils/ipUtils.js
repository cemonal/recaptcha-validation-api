const requestIp = require('request-ip');
const config = require('../config/config');

/**
 * Retrieves the client's IP address from the request.
 * @param {express.Request} req - The Express.js request object.
 * @returns {string} - The client's IP address.
 */
function getClientIp(req) {
    return requestIp.getClientIp(req);
}

/**
 * Checks if an IP address is local (localhost or a connected local network).
 * @param {string} ipAddress - The IP address to check.
 * @returns {boolean} - Returns true if the IP is local, otherwise false.
 */
function isLocalIp(ipAddress) {
    const localIPs = ['127.0.0.1', '0.0.0.0', '::1', '::ffff:127.0.0.1'];
    const localIPRanges = ['192.168.', '10.', '172.'];

    if (localIPs.includes(ipAddress) || localIPRanges.some(range => ipAddress.startsWith(range))) {
        return true;
    }

    if (ipAddress.startsWith('172.') && (parseInt(ipAddress.split('.')[1]) >= 16 && parseInt(ipAddress.split('.')[1]) <= 31)) {
        return true;
    }

    return false;
}

/**
 * Checks if an IP address is allowed based on the configuration.
 * @param {string} ip - The IP address to check.
 * @returns {boolean} - Returns true if the IP is allowed, otherwise false.
 */
function isIPAllowed(ip) {
    return config.allowedIPs.includes(ip);
}

module.exports = {
    getClientIp,
    isLocalIp,
    isIPAllowed,
    requestIp
};
