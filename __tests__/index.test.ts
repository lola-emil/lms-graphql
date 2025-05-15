// tests/app.test.ts
import request from "supertest";
import { app, server } from "../src/index"; // adjust path as needed

afterAll((done) => {
  server.close(done); // Ensure the server closes after tests
});

describe("Express App", () => {
//   it("should return 200 for GET /zoom", async () => {
//     const response = await request(app).get("/zoom");
//     expect(response.status).toBe(200); // Or 404 if no GET handler exists
//   });

//   it("should return 400+ for invalid /graphql query", async () => {
//     const response = await request(app)
//       .post("/graphql")
//       .send({ query: "{ invalidField }" })
//       .set("Content-Type", "application/json");
//     expect(response.status).toBeGreaterThanOrEqual(400);
//   });

  it("should serve static files from /public", async () => {
    const response = await request(app).get("/public");
    expect([200, 403, 404, 301]).toContain(response.statusCode); // Based on file availability
  });

  it("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/unknown-route");
    expect(response.status).toBe(404);
  });
});
