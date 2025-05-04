import { ApolloServer, BaseContext } from "@apollo/server";
import { gql } from "graphql-tag";

import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

import { userResolvers, userTypeDefs } from "./resolvers/user.resolver";
import { schoolYearResolvers, schoolYearTypeDefs } from "./resolvers/school-year.resolver";

import { teacherSubjectResolvers, teacherSubjectTypeDef } from "./resolvers/teacher-assigned-subject.resolver";
import { subjectResolvers, subjectTypDefs } from "./resolvers/subject.resolver";
import { studentEnrolledSubjectResolvers, studentEnrolledSubjectTypeDefs } from "./resolvers/student-enrolled-subject.resolver";
import { subjectMaterialResolvers, subjectMaterialTypeDefs } from "./resolvers/subject-material.resolver";
import { assignemtResolvers, assignmentTypeDefs } from "./resolvers/assignment.resolver";

import { assignmentAttachmentResolvers, assignmentAttachmentTypeDefs } from "./resolvers/assignment-attachment.resolver";

import { assignmentSubmissionResolvers, assignmentSubmissionTypeDefs } from "./resolvers/assignment-submission.resolver";


const typeDefs = mergeTypeDefs([
  gql`
      type Query
      type Mutation
    `,
  userTypeDefs,
  schoolYearTypeDefs,
  teacherSubjectTypeDef,
  subjectTypDefs,
  studentEnrolledSubjectTypeDefs,
  subjectMaterialTypeDefs,
  assignmentTypeDefs,
  assignmentAttachmentTypeDefs,
  assignmentSubmissionTypeDefs
]);

const resolvers = mergeResolvers([
  userResolvers,
  schoolYearResolvers,
  teacherSubjectResolvers,
  subjectResolvers,
  studentEnrolledSubjectResolvers,
  subjectMaterialResolvers,
  assignemtResolvers,
  assignmentAttachmentResolvers,
  assignmentSubmissionResolvers
]);


const apolloServer = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers
});

export default apolloServer;