import { PrismaClient } from "@prisma/client";
import { assignmentSubmissionResolvers } from "../../../../src/services/graphql/resolvers/assignment-submission.resolver"; // Adjust path

const prisma = new PrismaClient();

describe("assignmentSubmissionResolvers", () => {
    let sample: any;
  // Setup: Create a mock assignmentSubmission and assignmentSubmissionAttachment
  beforeAll(async () => {
    // Create test data in the database
    sample = await prisma.assignmentSubmission.create({
      data: {
        title: "Test Assignment 1",
        comment: "This is a test submission.",
        assignmentId: 1,
        studentId: 2,
      },
    });

    await prisma.assignmentSubmissionAttachment.create({
      data: {
        fileURL: "http://example.com/file1.pdf",
        assignmentSubmissionId: 1,
      },
    });
  });

  afterAll(async () => {
    // Clean up the test database
    await prisma.assignmentSubmission.delete({where: {id: sample.id}});
    // await prisma.assignmentSubmissionAttachment.deleteMany({});
    await prisma.$disconnect();
  });

  describe("Query.assignmentSubmissions", () => {
    it("should return all assignment submissions", async () => {
      const result = await assignmentSubmissionResolvers.Query.assignmentSubmissions();

      // Check if the result is an array and contains the expected fields
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            comment: expect.any(String),
            assignmentId: expect.any(Number),
            studentId: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe("Query.studentAssignmentSubmissions", () => {
    it("should return assignment submissions for a specific student", async () => {
      const result = await assignmentSubmissionResolvers.Query.studentAssignmentSubmissions({}, { studentId: 2 });

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            studentId: 2,
          }),
        ])
      );
    });
  });

  describe("Query.assignmentSubmission", () => {
    it("should return a single assignment submission by ID", async () => {
      const result = await assignmentSubmissionResolvers.Query.assignmentSubmission({}, { id: sample.id });

      expect(result).toEqual(
        expect.objectContaining({
          title: "Test Assignment 1",
          comment: "This is a test submission.",
        })
      );
    });
  });


});
