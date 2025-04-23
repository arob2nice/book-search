import { AuthenticationError } from "apollo-server-express";
import User from "../models/User.js";  // ✅ Default import
import Thought from "../models/Thoughts.js";
import signToken from "../services/signToken.js";  


// Define the TokenPayload interface
interface TokenPayload {
  _id: string;
  username: string;
}

// Define types for GraphQL arguments
interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginUserArgs {
  email: string;
  password: string;
}

interface UserArgs {
  username: string;
}

interface ThoughtArgs {
  thoughtId: string;
}

interface AddThoughtArgs {
  input: {
    thoughtText: string;
    thoughtAuthor: string;
  };
}

interface AddCommentArgs {
  thoughtId: string;
  commentText: string;
}

interface RemoveCommentArgs {
  thoughtId: string;
  commentId: string;
}

const resolvers = {
  Query: {
    users: async () => {
      return await User.find().populate("thoughts");
    },
    user: async (_parent: any, { username }: UserArgs) => {
      return await User.findOne({ username }).populate("thoughts");
    },
    thoughts: async () => {
      return await Thought.find().sort({ createdAt: -1 });
    },
    thought: async (_parent: any, { thoughtId }: ThoughtArgs) => {
      return await Thought.findById(thoughtId);
    },
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return await User.findById(context.user._id).populate("thoughts");
      }
      throw new AuthenticationError("You must be logged in to view this data.");
    },
  },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      const user = await User.create(input);
      if (!user) {
        throw new Error("User creation failed!");
      }
      // ✅ Convert _id to string
      const token = signToken(
        { _id: user._id.toString(), username: user.username } as TokenPayload,
        String(process.env.JWT_SECRET || "defaultSecret"),
        { expiresIn: "1h" }
      );
      return { token, user };
    },

    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("User not found!");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      // ✅ Convert _id to string
      const token = signToken(
        { _id: user._id.toString() as string, username: user.username },
        process.env.JWT_SECRET || "defaultSecret",
        { expiresIn: "1h" }
      );
      return { token, user };
    },

    addThought: async (_parent: any, { input }: AddThoughtArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to add a thought.");
      }

      const thought = await Thought.create(input);
      await User.findByIdAndUpdate(context.user._id, { $push: { thoughts: thought._id } });

      return thought;
    },

    addComment: async (_parent: any, { thoughtId, commentText }: AddCommentArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to add a comment.");
      }

      return await Thought.findByIdAndUpdate(
        thoughtId,
        { $push: { comments: { commentText, commentAuthor: context.user.username } } },
        { new: true, runValidators: true }
      );
    },

    removeThought: async (_parent: any, { thoughtId }: ThoughtArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to delete a thought.");
      }

      const thought = await Thought.findOneAndDelete({ _id: thoughtId, thoughtAuthor: context.user.username });

      if (!thought) {
        throw new AuthenticationError("Thought not found or you don't have permission to delete it.");
      }

      await User.findByIdAndUpdate(context.user._id, { $pull: { thoughts: thoughtId } });

      return thought;
    },

    removeComment: async (_parent: any, { thoughtId, commentId }: RemoveCommentArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to delete a comment.");
      }

      return await Thought.findByIdAndUpdate(
        thoughtId,
        { $pull: { comments: { _id: commentId, commentAuthor: context.user.username } } },
        { new: true }
      );
    },
  },
};

export default resolvers;
