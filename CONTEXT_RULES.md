# AGENT CONTEXT & OPERATIONAL BOUNDARIES

## 1. PROJECT ARCHITECTURE
* **Frontend Framework:** Next.js 15.4.5 (App Router)
* **Backend Runtime:** Node.js with Express 5 (Separate Service, NOT Next.js Custom Server)
* **Database:** PostgreSQL managed by Prisma ORM.
* **State Management:** Redux Toolkit (Global UI) & RTK Query (Data Fetching/Caching).
* **Styling:** Tailwind CSS 4 + Shadcn/UI.
* **Cloud Infrastructure:** AWS (S3 for storage, Cognito for auth).

## 2. STRICT IMPLEMENTATION RULES (DO NOT HALLUCINATE)
### A. WebSocket Protocol (Socket.io)
* **Server Attachment:** Attach `socket.io` to the HTTP server instance wrapping the Express app in `server/src/index.ts`.
* **State Integration:** Dispatch incoming socket events (`receive_message`, `room_update`) to Redux store.
* **Authentication:** Validate Cognito JWT tokens on socket connection.
* **Typing:** Use strict typing for all events.

### B. AWS & Auth Constraints
* **Authentication:** Verify `custom:role` claims in Cognito tokens. Frontend uses Amplify.
* **S3 Storage:** Use Pre-Signed URLs for uploads.

## 3. CODING STANDARDS
* **Redux Pattern:** Use `createSlice` for UI state and `createApi` (RTK Query) for server state.
* **Component Pattern:** Functional components only. Use `useAppDispatch` and `useAppSelector`.
* **Error Handling:** Standardized error objects.

## 4. CONTEXT WINDOW MANAGEMENT
* **Refactoring Strategy:** Minimize output for large files.
* **Import Safety:** Check `package.json` before importing.