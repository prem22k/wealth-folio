export async function verifyIdToken(idToken: string): Promise<string | null> {
    if (!idToken) return null;

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
        console.error("Missing Firebase API Key");
        return null;
    }

    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Token verification failed:", response.status, errorText);
            return null;
        }

        const data = await response.json();
        if (data.users && data.users.length > 0) {
            return data.users[0].localId;
        }

        return null;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}
