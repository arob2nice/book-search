import mongoose, { Schema, Document } from "mongoose";

export interface IThought extends Document {
  thoughtText: string;
  thoughtAuthor: string;
  createdAt: Date;
  comments: { commentText: string; commentAuthor: string }[];
}

const ThoughtSchema: Schema = new Schema(
  {
    thoughtText: { type: String, required: true, minlength: 1, maxlength: 280 },
    thoughtAuthor: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    comments: [
      {
        commentText: { type: String, required: true },
        commentAuthor: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Thought = mongoose.model<IThought>("Thought", ThoughtSchema);
export default Thought;