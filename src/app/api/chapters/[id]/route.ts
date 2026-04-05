import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  findFileMetadata,
  getFileContent,
  createFile,
  updateFile,
  findFolder,
  createFolder,
} from "@/lib/google-drive";

const CHAPTERS_FOLDER_NAME = "google-books-chapters";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const volumeId = params.id;
  const fileName = `${volumeId}.json`;
  const lastSynced = req.nextUrl.searchParams.get("lastSynced");

  try {
    const accessToken = session.accessToken as string;
    const folderId = await findFolder(accessToken, CHAPTERS_FOLDER_NAME);
    
    let metadata = null;
    if (folderId) {
      metadata = await findFileMetadata(accessToken, fileName, folderId);
    }

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
  const fileName = `${volumeId}.json`;
  const body = await req.json();

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
      const fileInFolder = await findFileMetadata(accessToken, fileName, folderId);
      if (fileInFolder) {
        result = await updateFile(accessToken, fileInFolder.id, body);
      } else {
        result = await createFile(accessToken, fileName, body, folderId);
      }
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
