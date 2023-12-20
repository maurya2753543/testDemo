const sno = 0x2b1c3052;
const challenge = 0x00007bd5;

function calcChallengeResponse(sno, challenge) {

  const fixedKey = 0x5553444a;  
  
  console.log("fixed key:", fixedKey.toString(16));
  console.log("serial no:", sno.toString(16));
  console.log("challenge:", challenge.toString(16));

  let key = fixedKey ^ sno;

  // STEP 1: Rotate (right) the lower 16 bits of the key. Amount of rotation is
  //         given by the least significant byte of the challenge
  let a1 = challenge & 0xff;
  let a2 = key & 0xffff;
  let A = ((a2 >> a1 % 16) | (a2 << (16 - (a1 % 16)))) & 0xffff; // rotate right

  // STEP 2: Rotate (left) the upper 16 bits of the key. Amount of rotation is
  //         given by the most significant byte of the challenge.
  let d1 = (challenge >> 24) & 0xff;

  let d2 = (key >> 16) & 0xffff;
  let D = ((d2 << d1 % 16) | (d2 >> (16 - (d1 % 16)))) & 0xffff; // rotate left

  key = (D << 16) | A;

  // Response is scrambled key XOR'd with challenge
  const resp = challenge ^ key;
  console.log("Response: ", resp.toString(16));
  return resp;
}
