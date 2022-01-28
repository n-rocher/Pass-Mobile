export const crypto = require("./crypto")

export function createDigest(algorithm, hmacKey, counter) {
    const hmac = crypto.createHmac(algorithm, Buffer.from(hmacKey, 'hex'));
    const digest = hmac.update(Buffer.from(counter, 'hex')).digest();
    return digest.toString('hex');
}

export function createRandomBytes(size, encoding) { return crypto.randomBytes(size).toString(encoding) }
