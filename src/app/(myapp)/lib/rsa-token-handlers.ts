import jwt, { JwtPayload } from 'jsonwebtoken';
import fs from 'fs';
import { LRUCache } from 'lru-cache';


export async function getOrFetchToken(key: string, cache: LRUCache<string, string>): Promise<string> {
    let token = cache.get(key);

    if (!token) {
        token = await fetchNewToken();
        cache.set(key, token);
    }

    return token;
}

export function getAPISecretKey(): string | boolean {
    const keyPath = process.env.JWT_PRIVATE_KEY;
    if (!keyPath) {
        return false;
    }
    try {
        return fs.readFileSync(keyPath, 'utf-8');
    } catch (error) {
        console.error('Failed to read JWT private key file:', error);
        return false;
    }
};

export async function fetchNewToken(): Promise<string> {

    const ttl = Math.floor(Date.now() / 1000) + 60 * 60; // 60 mins

    const key = process.env.JWT_KEY ?? '';

    return await generateRS256Token({
        key,
        exp: ttl,
    });
}

export async function generateRS256Token({ ...payload }: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
        const privateKey = getAPISecretKey() as string;
        const options: jwt.SignOptions = {
            algorithm: 'RS256',
        };

        jwt.sign(payload, privateKey, options, (err, token) => {
            if (err || !token) {
                reject(err || new Error('Error generating token'));
                return;
            }
            resolve(token);
        });
    });
}

export async function verifyRS256Token(token: string, filePath: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        const publicKey = process.env.JWT_KEY ?? '';

        const options: jwt.VerifyOptions = {
            algorithms: ['RS256'],
        };

        jwt.verify(token, publicKey, options, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(decoded as JwtPayload);
        });
    });
}