import * as web3 from '@solana/web3.js'


export function isAccount(pubKeyStr: string): Boolean {
  try {
    const owner = new web3.PublicKey(pubKeyStr);
    return web3.PublicKey.isOnCurve(owner.toBytes());
  } catch (error) {
    return false
  }
}

export function generateRandomString(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}