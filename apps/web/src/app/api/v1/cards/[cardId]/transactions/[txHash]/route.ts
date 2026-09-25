import { handleTransactionRequest } from "@/backend/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ cardId: string; txHash: string }> },
): Promise<Response> {
  const { cardId, txHash } = await context.params;
  return handleTransactionRequest(request, cardId, txHash);
}
