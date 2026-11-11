import{z} from "zod";
export const aiChatSchema= z.object({
    message:z.string().trim().min(2).max(2000),
    destination:z.string().trim().min(2).max(100).optional()
});
export type aiChatSchema= z.infer<typeof aiChatSchema>;

