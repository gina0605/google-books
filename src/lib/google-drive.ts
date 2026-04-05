const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export async function findFileMetadata(accessToken: string, fileName: string): Promise<DriveFile | null> {
  const q = encodeURIComponent(`name = '${fileName}' and trashed = false`);
  const response = await fetch(
    `${DRIVE_API_BASE}/files?q=${q}&fields=files(id, name, modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error finding file metadata:", error);
    return null;
  }

  const data = await response.json();
  return data.files.length > 0 ? data.files[0] : null;
}

export async function getFileContent(accessToken: string, fileId: string): Promise<any> {
  const response = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error getting file content:", error);
    return null;
  }

  return response.json();
}

export async function createFile(accessToken: string, fileName: string, content: any): Promise<DriveFile | null> {
  const metadata = {
    name: fileName,
    mimeType: "application/json",
  };

  const boundary = "foo_bar_baz";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(content) +
    closeDelim;

  const response = await fetch(
    `${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,modifiedTime`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: body,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error creating file:", error);
    return null;
  }

  return response.json();
}

export async function updateFile(accessToken: string, fileId: string, content: any): Promise<DriveFile | null> {
  const response = await fetch(
    `${UPLOAD_API_BASE}/files/${fileId}?uploadType=media&fields=id,name,modifiedTime`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error updating file:", error);
    return null;
  }

  return response.json();
}
