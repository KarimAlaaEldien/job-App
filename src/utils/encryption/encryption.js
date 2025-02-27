import Cryptojs from "crypto-js"


export const encrypt=({plainText,secret_key=process.env.SECRET_KEY})=>{
    return Cryptojs.AES.encrypt(plainText,secret_key).toString()
}

export const decrypt=({cipherText,secret_key=process.env.SECRET_KEY})=>{
    return Cryptojs.AES.decrypt(cipherText,secret_key).toString(Cryptojs.enc.Utf8)
}