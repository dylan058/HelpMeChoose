/**
 * Created by Dylan on 15/5/23.
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function tostr (bytes) {
    var a = [];
    for (var i = 0; i < bytes.length; i++) {
        a.push(chars[bytes[i] % chars.length]);
    }
    return a.join('');
}

function generateUid (length) {
    var a = new Uint32Array(length);
    var cryptoObj = window.crypto || window.msCrypto;
    cryptoObj.getRandomValues(a);
    return tostr(a);
}