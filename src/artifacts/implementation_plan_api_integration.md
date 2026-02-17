
You have requested to integrate the real API (`http://localhost:5000/api`) into the React frontend. This involves replacing mock data in Authentication, Products, and Cart contexts with actual API calls.

## User Review Required

> [!IMPORTANT]
> **Admin Logic**: The API documentation states registering with `meetbhesara26@gmail.com` makes the user an **Admin**. I will verify this logic on the frontend to show Admin-specific controls (like "Add Product" if acceptable).

> [!IMPORTANT]
> **Cart Strategy**: The API requires a `sessionId`.
> *   **Proposal**: I will generate a unique UUID for the session and store it in `localStorage` ('sessionId'). I will use this for all guest cart operations. This ensures cart persistence even before login.

> [!IMPORTANT]
> **Quotation Format**: The `POST /quotations` endpoint accepts `htmlContent`.
> *   **Proposal**: When a user clicks "Send Enquiry", I will generate a clean HTML string (Table of products with images and details) on the client side and send this string to the API.

- [ ] **Step 1: API Utility Setup**
    - Install `axios` for HTTP requests.
    - Create `src/api/axios.js` with the Base URL (`http://localhost:5000/api`).
    - Configure an interceptor to automatically attach the `Authorization: Bearer <token>` header if a token exists in local storage.

- [ ] **Step 2: Refactor Authentication (`AuthContext`)**
    - Remove mock login/register logic.
    - Implement `login(email, password)` calling `POST /auth/login`.
    - Implement `register(name, email, password, contact)` calling `POST /auth/register`.
    - Persist the received JWT `token` and `user` info to `localStorage`.
    - Update `AuthModal` to pass the correct parameters (split `name` and `contact` correctly).

- [ ] **Step 3: Refactor Products**
    - Update `Products.jsx` to fetch data from `GET /products` using the new API utility.
    - Map the API response fields to the UI:
        - `photos` -> Carousel images.
        - `ISI`, `specifications`, `pdf`, `video` -> Add new UI sections in the Product Card (or a Detail Modal) to display these.
    - **Vertical Layout**: Ensure the previously requested vertical layout is preserved with dynamic data.

- [ ] **Step 4: Refactor Cart (`CartContext`)**
    - **Session Management**: Generate and store a `sessionId` on app load if one doesn't exist.
    - **Fetch Cart**: `GET /cart/:sessionId` to load initial state.
    - **Add Item**: `POST /cart` with `{ sessionId, productId, quantity }`.
    - **UI Update**: specific "Add to Enquiry" actions will now sync with the server.

- [ ] **Step 5: Implement Quotation/Enquiry**
    - Update the `EnquiryModal`.
    - **Generate HTML**: Create a helper function `generateQuotationHTML(cartItems, userDetails)` that creates a styled HTML table string.
    - **Send**: Call `POST /quotations` with this HTML content.
    - Show success message "Quotation sent successfully".

- [ ] **Step 6: Admin Features (Basic)**
    - If User is Admin (`meetbhesara26@gmail.com`):
        - Show "Edit" and "Delete" buttons on Product Cards.
        - (Optional) detailed "Add Product" form if time permits, otherwise ensure the fetch handles the display correctly.

## Verification Plan

### Automated Tests
- None planned for this iteration (manual verification preferred for UI flows).

### Manual Verification
1.  **Auth**: Register with a random email -> Check network tab for 200 OK -> Check LocalStorage for Token.
2.  **Products**: Load page -> Verify network call to `/products` -> Verify images (photos) and specs appear.
3.  **Cart**: Add item -> Reload page -> Verify cart persists (via API/SessionID).
4.  **Enquiry**: Click "Make Enquiry" -> Submit -> Verify `POST /quotations` sends valid HTML.
