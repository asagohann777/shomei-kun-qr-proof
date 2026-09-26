import { handlePrepareRequest } from "@/backend/http";

export async function POST(request: Request, context: { params: Promise<{ cardId: string }> }): Promise<Response> {
  const { cardId } = await context.params;
  return handlePrepareRequest(request, cardId);
}

export const OPTIONS = POST;
