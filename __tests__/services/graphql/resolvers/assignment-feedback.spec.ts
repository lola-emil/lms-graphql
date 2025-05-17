import { PrismaClient } from "@prisma/client";
import { assignmentFeedbackResolvers } from "../../../../src/services/graphql/resolvers/assignment-feedback.resolver"; // Adjust path

const prisma = new PrismaClient();

describe("assignmentFeedbackResolvers", () => {
    let sample: any;

    beforeAll(async () => {
        sample = await prisma.assignmentFeedback.create({
            data: {
                comment: "Great work!",
                mark: 85.5,
                studentSubmissionId: 1,
                teacherId: 2,
            }
        });
    });

    afterAll(async () => {
        // Clean up the test database
        await prisma.assignmentFeedback.delete({ where: { id: sample.id } });
        await prisma.$disconnect();
    });

    describe("Query.assignmentFeedbacks", () => {
        it("should return all assignment feedbacks", async () => {
            // Call the resolver directly (no mocks)
            const result = await assignmentFeedbackResolvers.Query.assignmentFeedbacks();

            // Check if the result is what you expect
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        comment: expect.any(String),
                        mark: expect.any(Number),
                        studentSubmissionId: expect.any(Number),
                        teacherId: expect.any(Number),
                    }),
                ])
            );
        });
    });

    describe("Query.assignmentFeedback", () => {
        it("should return an assignment feedback by ID", async () => {
            // Fetch the data inserted during setup (it should have id = 1)
            const feedback = await prisma.assignmentFeedback.findUnique({
                where: { id: sample.id },
            });

            // Call the resolver directly (no mocks)
            const result = await assignmentFeedbackResolvers.Query.assignmentFeedback({}, { id: feedback!.id });

            // Check if the result matches the data from the database
            expect(result).toEqual(feedback);
        });
    });

    describe("Query.feedbackFromSubmission", () => {
        it("should return assignment feedback by submission ID", async () => {
            const feedbacks = await prisma.assignmentFeedback.findMany({
                where: { studentSubmissionId: 1 },
            });

            const result = await assignmentFeedbackResolvers.Query.feedbackFromSubmission({}, { submissionid: 1 });

            // Check if the result is the same as the data in the database
            expect(result).toEqual(feedbacks);
        });
    });


});
