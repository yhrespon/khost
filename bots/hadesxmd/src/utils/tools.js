export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}