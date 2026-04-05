import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  findFileMetadata,
  getFileContent,
  createFile,
  updateFile,
} from "@/lib/google-drive";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const volumeId = params.id;
  const fileName = `google-books-chapters-${volumeId}.json`;
  const lastSynced = req.nextUrl.searchParams.get("lastSynced");

  try {
    const metadata = await findFileMetadata(session.accessToken as string, fileName);

    if (!metadata) {
      return NextResponse.json({ chapters: [], lastSynced: null });
    }

    // Compare modifiedTime with lastSynced
    if (lastSynced && new Date(metadata.modifiedTime) <= new Date(lastSynced)) {
      return NextResponse.json({ upToDate: true });
    }

    const content = await getFileContent(session.accessToken as string, metadata.id);
    return NextResponse.json({
      chapters: content,
      lastSynced: metadata.modifiedTime,
    });
  } catch (error) {
    console.error("Error in GET /api/chapters/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const volumeId = params.id;
  const fileName = `google-books-chapters-${volumeId}.json`;
  const body = await req.json();

  try {
    const metadata = await findFileMetadata(session.accessToken as string, fileName);

    let result;
    if (metadata) {
      result = await updateFile(session.accessToken as string, metadata.id, body);
    } else {
      result = await createFile(session.accessToken as string, fileName, body);
    }

    if (!result) {
      return NextResponse.json({ error: "Failed to save to Drive" }, { status: 500 });
    }

    return NextResponse.json({ lastSynced: result.modifiedTime });
  } catch (error) {
    console.error("Error in POST /api/chapters/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
