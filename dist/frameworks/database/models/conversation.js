"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    courseId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "please enter a valid courseId"],
    },
    participants: [
        {
            type: [String],
            ref: "User",
            required: [true, "please enter a valid userId"],
        },
    ],
    messages: [
        {
            type: [mongoose_1.default.Schema.Types.ObjectId],
            ref: "Message",
            required: [true, "please enter a valid messageId"],
        },
    ],
}, { timestamps: true });
exports.conversationModel = mongoose_1.default.model("conversation", conversationSchema);
//# sourceMappingURL=conversation.js.map