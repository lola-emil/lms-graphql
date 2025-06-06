import { ApolloServer, BaseContext } from "@apollo/server";
import { gql } from "graphql-tag";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { userResolvers, userTypeDefs } from "./resolvers/user.resolver";
import { schoolYearResolvers, schoolYearTypeDefs } from "./resolvers/school-year.resolver";
import { teacherSubjectResolvers as teacherAssignedSubjectResolvers, teacherSubjectTypeDef as teacherAssignedSubjectTypeDef } from "./resolvers/teacher-assigned-subject.resolver";
import { subjectResolvers, subjectTypDefs } from "./resolvers/subject.resolver";
import { studentEnrolledSubjectResolvers, studentEnrolledSubjectTypeDefs } from "./resolvers/student-enrolled-subject.resolver";
import { subjectMaterialResolvers, subjectMaterialTypeDefs } from "./resolvers/subject-material.resolver";
import { assignemtResolvers, assignmentTypeDefs } from "./resolvers/assignment.resolver";
import { assignmentAttachmentResolvers, assignmentAttachmentTypeDefs } from "./resolvers/assignment-attachment.resolver";
import { assignmentSubmissionResolvers, assignmentSubmissionTypeDefs } from "./resolvers/assignment-submission.resolver";
import { questionResolvers, questionTypeDef } from "./resolvers/question.resolver";
import { classLevelResolvers, classLevelTypeDefs } from "./resolvers/class-level.resolver";
import { classSectionResolvers, classSectionTypeDefs } from "./resolvers/class-section.resolver";
import { calendarEventResolvers, calendarEventTypeDefs } from "./resolvers/calendar-event.resolver";
import { assignmentFeedbackDefs, assignmentFeedbackResolvers } from "./resolvers/assignment-feedback.resolver";
import { subjectMaterialAttachmentDefs, subjectMaterialAttachmentResolvers } from "./resolvers/subject-material-attachment.resolver";
import { quizSessionResolvers, quizSessionTypeDef } from "./resolvers/quiz-session.resolver";
import { forumResolvers, forumTypeDef } from "./resolvers/forum.resolver";
import { studentGradeDefs, studentGradeResolver } from "./resolvers/student-grade.resolver";
import { studentEnrolledSectionResolver, studentEnrolledSectionTypeDef } from "./resolvers/student-enrolled-section.resolver";
import { teacherSubjectResolvers, teacherSubjectTypeDef } from "./resolvers/teacher-subject.resolver";
import { teacherSubjectSectionResolver, teacherSubjectSectionTypeDefs } from "./resolvers/teacher-subject-section.resolver";

const typeDefs = mergeTypeDefs([
  gql`
      type Query
      type Mutation
    `,
  teacherSubjectTypeDef,
  teacherSubjectSectionTypeDefs,
  studentEnrolledSectionTypeDef,
  userTypeDefs,
  schoolYearTypeDefs,
  teacherAssignedSubjectTypeDef,
  subjectTypDefs,
  studentEnrolledSubjectTypeDefs,
  subjectMaterialTypeDefs,
  assignmentTypeDefs,
  assignmentAttachmentTypeDefs,
  assignmentSubmissionTypeDefs,
  questionTypeDef,
  forumTypeDef,
  quizSessionTypeDef,
  studentGradeDefs,

  classLevelTypeDefs,
  classSectionTypeDefs,
  calendarEventTypeDefs,
  assignmentFeedbackDefs,
  subjectMaterialAttachmentDefs,
]);

const resolvers = mergeResolvers([
  studentEnrolledSectionResolver,
  userResolvers,
  forumResolvers,
  schoolYearResolvers,
  teacherAssignedSubjectResolvers,
  subjectResolvers,
  studentEnrolledSubjectResolvers,
  subjectMaterialResolvers,
  assignemtResolvers,
  assignmentAttachmentResolvers,
  assignmentSubmissionResolvers,
  questionResolvers,
  classLevelResolvers,
  classSectionResolvers,
  calendarEventResolvers,
  assignmentFeedbackResolvers,
  subjectMaterialAttachmentResolvers,
  quizSessionResolvers,
  studentGradeResolver,
  teacherSubjectResolvers,
  teacherSubjectSectionResolver
]);


const apolloServer = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers
});

export default apolloServer;