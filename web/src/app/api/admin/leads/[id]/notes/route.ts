import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateAdminAccess } from "@/lib/admin-auth";

/**
 * Notes API for a single lead (admin operator annotations).
 *
 * GET  /api/admin/leads/[id]/notes — all notes for the lead, newest first.
 * POST /api/admin/leads/[id]/notes — create a note ({ content }, min 1 char).
 */

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const authError = validateAdminAccess(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const { id } = await params;

  const notes = await prisma.leadNote.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, notes });
}

export async function POST(request: NextRequest, { params }: Params) {
  const authError = validateAdminAccess(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const { id } = await params;

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) {
    return NextResponse.json(
      { error: "content is required (min 1 char)" },
      { status: 400 }
    );
  }

  // 404 when the lead doesn't exist (or is soft-deleted).
  const lead = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const note = await prisma.leadNote.create({
    data: { leadId: id, content },
  });

  return NextResponse.json({
    success: true,
    note: { id: note.id, content: note.content, createdAt: note.createdAt },
  });
}
