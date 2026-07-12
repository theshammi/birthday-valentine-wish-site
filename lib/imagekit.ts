import ImageKit from "imagekit";

let imagekitInstance: ImageKit | null = null;

export function getImageKitInstance(): ImageKit {
  if (!imagekitInstance) {
    imagekitInstance = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "mock_public_key",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "mock_private_key",
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "mock_url_endpoint",
    });
  }
  return imagekitInstance;
}

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
}

export function getAuthenticationParameters(): ImageKitAuthParams {
  return getImageKitInstance().getAuthenticationParameters();
}

