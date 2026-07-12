import { NextResponse } from "next/server";
import { getAuthenticationParameters } from "../../../../lib/imagekit";
import { isAdminAuthenticated } from "../../../../app/actions";

export async function GET() {
  try {
    const isAuthorized = await isAdminAuthenticated();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authParams = getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error("Failed to generate ImageKit authentication parameters", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
