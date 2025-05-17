import * as config from "../../src/config/constants";
describe("Environment variable configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clears cached modules
    process.env = { ...originalEnv }; // Clone original env
  });

  afterEach(() => {
    process.env = originalEnv; // Restore original env
  });

  it("should read values from process.env when set", () => {
    process.env["DB_HOST"] = "localhost";
    process.env["DB_PORT"] = "3306";
    process.env["DB_NAME"] = "lms_graphql";
    // process.env["HOSTNAME"] = "api.example.com";
    process.env["PORT"] = "8080";
    process.env["BUSINESS_NAME"] = "Example Inc.";
    process.env["JWT_SECRET_KEY"] = "super-secret";
    process.env["MAILER_HOST"] = "smtp.example.com";
    process.env["MAILER_ADDRESS"] = "admin@example.com";
    process.env["MAILER_PASSWORD"] = "emailpass";
    process.env["ZOOM_MEETING_SDK_KEY"] = "sdk-key";
    process.env["ZOOM_MEETING_SDK_SECRET"] = "sdk-secret";
    process.env["ZOOM_CLIENT_ID"] = "client-id";
    process.env["ZOOM_CLIENT_SECRET"] = "client-secret";


    expect(config.DB_HOST).toBe("localhost");
    expect(config.DB_PORT).toBe(3306);
    expect(config.DB_NAME).toBe("lms_graphql");

    expect(config.PORT).toBe(4000);

    expect(config.MAILER_HOST).toBe("smtp.gmail.com");
    // expect(config.MAILER_ADDRESS).toBe("admin@gmail.com");

  });
});
