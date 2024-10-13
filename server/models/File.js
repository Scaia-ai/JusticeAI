import mongoose, {Schema} from "mongoose";

const FileSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        guid:{
            type: String,
            required: true
        }, 
        extractedText:{
            type: String,
            required: true
        },
        case: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Case"
       },
       user: {
           type: Schema.Types.ObjectId,
           required: true,
           ref: "User"
      }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("File", FileSchema);