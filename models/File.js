import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  modifiedToFilePath: {
    type: String,
    required: true,
  },
});

const File = mongoose.model("File", fileSchema);
export default File;
