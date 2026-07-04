import ImageKit from '@imagekit/nodejs';

// Initialize ImageKit client
// We read from environment variables for security, fallback to your default private key if not set.
export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_G3M1KD+ELDvq3r8IVBqucEXmu6A=
  ',
});
