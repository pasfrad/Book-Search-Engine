const { User, Book } = require('./models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
     me: async (parent, args, context) => {
        if (context.user) {
            return User.findOne({ _id: context.user._id }).populate('savedBooks');
        }
        throw new AuthenticationError('Log in to see your books')      
    },
},

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password}) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Something went wrong');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Something went wrong');
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
            const user = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: input } },
                { new: true }
            );
            return user;
            }
            throw new AuthenticationErrer('You must be logged in');
        },
        deleteBook: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );
            return user;
            }
            throw new AuthenticationError('You must be logged in');
        },
    }
};

module.exports = resolvers;