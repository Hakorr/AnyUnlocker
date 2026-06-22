const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

function xor(data, key) {
    const out = new Uint8Array(data.length);

    for(let i = 0; i < data.length; i++) {
        out[i] = data[i] ^ key[i % key.length];
    }

    return out;
}

function encodeBase32(bytes) {
    let bits = 0;
    let value = 0;
    let out = '';

    for(const b of bytes) {
        value |= b << bits;
        bits += 8;

        while(bits >= 5) {
            out += ALPHABET[value & 31];
            value >>= 5;
            bits -= 5;
        }
    }

    if(bits > 0) {
        out += ALPHABET[value & 31];
    }

    return out;
}

function encode(str, keyStr) {
    const data = new TextEncoder().encode(str);
    const key = new TextEncoder().encode(keyStr);

    const xored = xor(data, key);
    return encodeBase32(xored);
}