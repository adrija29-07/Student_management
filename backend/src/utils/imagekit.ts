import ImageKit from '@imagekit/nodejs';

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'public_5/b9rF+DZZ5evlWmiaHTX2rIj0Y=';
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_G3M1KD+ELDvq3r8IVBqucEXmu6A=';
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/5gajekfkd0';

// Initialize ImageKit client with all required values for upload support.
export const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
} as any);

export default imagekit;
