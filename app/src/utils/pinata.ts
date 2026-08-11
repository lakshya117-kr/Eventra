import { PINATA_JWT, PINATA_GATEWAY } from './constants';

/**
 * Upload a file to IPFS via Pinata.
 * Returns the CID (Content Identifier).
 */
export async function uploadFileToPinata(file: File): Promise<string> {
  if (!PINATA_JWT || PINATA_JWT === 'your_pinata_jwt_here') {
    console.warn("Pinata JWT not configured. Returning mock CID for image.");
    return "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"; // Mock CID
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`Pinata upload failed: ${res.statusText}`);
  const data = await res.json();
  return data.IpfsHash;
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 * Returns the metadata CID.
 */
export async function uploadMetadataToPinata(metadata: Record<string, unknown>): Promise<string> {
  if (!PINATA_JWT || PINATA_JWT === 'your_pinata_jwt_here') {
    console.warn("Pinata JWT not configured. Returning mock CID for metadata.");
    return "QmZ4tDuvesek1363s8Tcv534aKq7zmbUvjEDzE9n27fX2E"; // Mock CID
  }

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `event-${Date.now()}` },
    }),
  });

  if (!res.ok) throw new Error(`Pinata metadata upload failed: ${res.statusText}`);
  const data = await res.json();
  return data.IpfsHash;
}

/**
 * Fetch metadata JSON from IPFS via Pinata gateway.
 */
export async function fetchMetadataFromIPFS(cid: string): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${PINATA_GATEWAY}/ipfs/${cid}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Convert an IPFS URI (ipfs://CID) to an HTTP gateway URL */
export function ipfsToHttp(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return `${PINATA_GATEWAY}/ipfs/${uri.slice(7)}`;
  }
  return uri;
}
