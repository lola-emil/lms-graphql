import generatePassword from "../../src/util/password-generator"; // Update this

describe("generatePassword", () => {
  const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghuklmnopqrstuvwxyz1234567890";

  it("should generate a password with default length of 8", () => {
    const password = generatePassword();
    expect(password).toHaveLength(8);
  });

  it("should generate a password of specified length", () => {
    const length = 20;
    const password = generatePassword(length);
    expect(password).toHaveLength(length);
  });

  it("should only contain allowed characters", () => {
    const password = generatePassword(100); // long enough to test character randomness
    for (const char of password) {
      expect(allowedChars).toContain(char);
    }
  });

  it("should return an empty string if length is 0", () => {
    expect(generatePassword(0)).toBe("");
  });

  it("should return an empty string if length is negative", () => {
    expect(generatePassword(-5)).toBe("");
  });
});
