

export default function generatePassword(length: number = 8): string {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghuklmnopqrstuvwxyz1234567890`!~@#$%^&*()_+-=~;:'.,/?";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}