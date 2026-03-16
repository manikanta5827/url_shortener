import { customAlphabet } from 'nanoid';

const customChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const customLength = 5;

export const generateRandomUUID = (): string => {
    return customAlphabet(customChars, customLength)();
}