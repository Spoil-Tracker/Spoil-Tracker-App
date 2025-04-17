
import { db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Creates a unique invite link for sharing kitchen access.
 *
 * @param owner_id - The ID of the user creating the invite.
 * @returns A unique kitchen invite URL string.
 */
export async function createKitchenInvite(owner_id: string): Promise<string> {
  // Generate a unique invite code
  const timestamp = Date.now(); // milliseconds since epoch
  const random = Math.random().toString(36).substring(2, 8); // 6-char random string
  const inviteCode = `${owner_id}-${timestamp}-${random}`;

  const inviteRef = doc(db, 'invites', inviteCode);

  // Store invite metadata
  const inviteData = {
    inviteCode,
    owner_id,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  try {
    await setDoc(inviteRef, inviteData);
    return `https://localhost:8081/join-kitchen/${inviteCode}`;
  } catch (error) {
    console.error('Failed to create invite:', error);
    throw new Error('Could not generate invite link.');
  }
}