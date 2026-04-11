import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  findFileMetadata,
  createFile,
  updateFile,
  findFolder,
  createFolder,
  getBookData,
  CHAPTERS_FOLDER_NAME,
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
  const lastSynced = req.nextUrl.searchParams.get("lastSynced");

  try {
    const accessToken = session.accessToken as string;
    const { chapters, offset, notes, modifiedTime } = await getBookData(accessToken, volumeId);

    // Compare modifiedTime with lastSynced
    if (lastSynced && modifiedTime && new Date(modifiedTime) <= new Date(lastSynced)) {
      return NextResponse.json({ upToDate: true });
    }

    return NextResponse.json({
      chapters,
      offset,
      notes,
      lastSynced: modifiedTime,
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
  const fileName = `${volumeId}.json`;
  const body = await req.json(); // body is { offset, chapters }

  try {
    const accessToken = session.accessToken as string;
    let folderId = await findFolder(accessToken, CHAPTERS_FOLDER_NAME);
    if (!folderId) {
      folderId = await createFolder(accessToken, CHAPTERS_FOLDER_NAME);
    }

    if (!folderId) {
      return NextResponse.json({ error: "Failed to create folder on Drive" }, { status: 500 });
    }

    // Try to find the file in the folder
    let metadata = await findFileMetadata(accessToken, fileName, folderId);
    
    let result;
    if (metadata) {
      result = await updateFile(accessToken, metadata.id, body);
    } else {
      result = await createFile(accessToken, fileName, body, folderId);
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
