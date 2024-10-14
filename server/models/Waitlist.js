import mongoose, {Schema} from "mongoose";

const WaitListSchema = mongoose.Schema(
    {
        email:{
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Waitlist", WaitListSchema);