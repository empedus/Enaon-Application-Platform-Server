var CryptoJS = require("crypto-js");

var key = CryptoJS.enc.Utf8.parse('0AC54DDB36684B9DB6A58D1BB50517E7');
var iv = CryptoJS.enc.Utf8.parse('94B2F6AF12CF4A68');

function encrypt(text) {
    var encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64); // Convert to Base64
}

function decrypt(encryptedBase64) {
    var encryptedHex = CryptoJS.enc.Base64.parse(encryptedBase64); // Convert from Base64 to WordArray
    var decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedHex }, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    return decrypted.toString(CryptoJS.enc.Utf8); // Convert to UTF-8
}


module.exports = {
    encrypt,
    decrypt
};