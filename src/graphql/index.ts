import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';

import { userResolvers } from './resolvers/user.resolver';

const typeDefs = mergeTypeDefs(loadFilesSync(__dirname + '/schema/*.graphql'));
const resolvers = mergeResolvers([
    userResolvers,
]);

export { typeDefs, resolvers };