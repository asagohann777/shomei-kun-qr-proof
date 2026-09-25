import { handleCardRequest } from "@/backend/http";

export async function GET(request: Request, context: { params: Promise<{ cardId: string }> }): Promise<Response> {
  const { cardId } = await context.params;
  return handleCardRequest(request, cardId);
}

export const OPTIONS = GET;
