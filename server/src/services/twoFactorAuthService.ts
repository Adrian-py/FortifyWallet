import { randomBytes } from "crypto";
import { encode } from "hi-base32";
import { TOTP } from "otpauth";
import { toDataURL } from "qrcode";

async function enableTwoFactorAuth() {
  const secret = generateBase32Secret();
  const totp = new TOTP({
    issuer: "FortifyWallet.com",
    label: "FortifyWallet",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  const temp = await toDataURL(totp.toString());
  const two_factor_data = {
    secret,
    qrUrl: temp,
  };
  return two_factor_data;
}

async function verifyTwoFactorAuth(secret: string, otp: string) {
  const totp = new TOTP({
    issuer: "FortifyWallet.com",
    label: "FortifyWallet",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return totp.validate({ token: otp });
}

function generateBase32Secret() {
  const buffer = randomBytes(15);
  return encode(buffer).replace(/=/g, "").substring(0, 24);
}

export { enableTwoFactorAuth, verifyTwoFactorAuth };
