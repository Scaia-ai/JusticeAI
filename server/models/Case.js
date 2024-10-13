import mongoose, {Schema} from "mongoose";

const CaseSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        number:{
            type: String,
            required: true
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

export default mongoose.model("Case", CaseSchema);