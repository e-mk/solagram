import * as web3 from '@solana/web3.js'


export function isAccount(pubKeyStr: string): Boolean {
  try {
    const owner = new web3.PublicKey(pubKeyStr);
    return web3.PublicKey.isOnCurve(owner.toBytes());
  } catch (error) {
    return false
  }
}