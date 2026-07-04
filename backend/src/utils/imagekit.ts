import ImageKit from '@imagekit/nodejs';

// Initialize ImageKit client
export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_G3M1KD+ELDvq3r8IVBqucEXmu6A=',
});

export default imagekit;
