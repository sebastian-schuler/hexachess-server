export const getRandomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
  
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString.toUpperCase();
}

export const getNthLetter = (n: number): string => {

  if (n < 1 || n > 26) {
      return '';
  }

  const asciiOfA = 'A'.charCodeAt(0) - 1;
  const nthLetter = String.fromCharCode(asciiOfA + n);

  return nthLetter;
}