import { PrismaClient } from "@prisma/client";
import { assignmentAttachmentResolvers } from "../../../../src/services/graphql/resolvers/assignment-attachment.resolver";

const prisma = new PrismaClient();

describe("assignmentAttachmentResolvers", () => {
  
  beforeAll(async () => {
    // Ensure the test database is set up or seeded here
    // For example, you can seed data to be used in the test
    await prisma.assignmentAttachment.create({
      data: {
        fileURL: "http://example.com/file.pdf",
        assignmentId: 1,
      }
    });
  });

  afterAll(async () => {
    // Clean up the test database
    await prisma.assignmentAttachment.deleteMany({});
    await prisma.$disconnect();
  });

  describe("Query.assignmentAttachments", () => {
    it("should return all assignment attachments", async () => {
      // Call the resolver directly (no mocks)
      const result = await assignmentAttachmentResolvers.Query.assignmentAttachments();

      // Check if the result is what you expect
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fileURL: expect.any(String),
            assignmentId: expect.any(Number),
          }),
        ])
      );
    });
  });

});
