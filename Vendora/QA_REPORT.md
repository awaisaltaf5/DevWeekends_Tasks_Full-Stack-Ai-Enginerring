# Vendora Usability QA Report

**Application:** Vendora multi-vendor e-commerce marketplace  
**Review date:** 10 September 2026  
**Review method:** Heuristic evaluation using Nielsen's 10 usability heuristics, supported by source inspection and a live browser smoke test.  
**Test environment:** Windows, React development server at `http://localhost:3000`, Express API at `http://localhost:8000`, Socket.IO at `http://localhost:4000`, seeded MongoDB data.

## 1. Application Overview

Vendora is a MERN-based marketplace with three user roles:

- **Buyer:** browse/search products and events, use wishlist/cart, checkout, pay, track orders, and message sellers.
- **Seller:** create and manage a shop, products, events, coupons, orders, withdrawals, and messages.
- **Admin:** manage users, sellers, orders, products, events, and withdrawal requests.

The main buyer journey is: Home -> Products -> Product details -> Cart -> Checkout -> Payment -> Order tracking. Seller and admin journeys use protected dashboard routes.

## 2. Test Scope and Limitations

The public buyer screens were exercised in a live browser. Product search was tested with the term `speaker`. The application was also opened while the API/socket services were unavailable to evaluate failure handling. Protected seller/admin screens were reviewed through route/component inspection because no test credentials were supplied. Payment, email, Google login, and real-time chat were not completed with external providers.

Severity used in this report:

- **High:** blocks a key task, causes misleading results, or exposes an uncaught failure.
- **Medium:** causes substantial confusion, extra work, or an accessibility/usability barrier.
- **Low:** minor wording, consistency, or polish issue.

## 3. Heuristic Findings

| Heuristic | Observed issue | Page/screen | Severity | Suggested improvement |
|---|---|---|---|---|
| 1. Visibility of system status | When the API is unavailable, the page remains partly rendered but the browser shows uncaught Axios runtime errors. The user is not given a normal loading, offline, retry, or service-unavailable message. | Home page and any data-loading page when backend is down | **High** | Catch request failures in Redux/actions, show a user-facing error state with a Retry button, and prevent development error overlays from being the only feedback in production. Show progress during product/event loading. |
| 2. Match between system and real world | Checkout uses technical labels such as `Address1` and `Address2`. The field labelled `City` is populated from state/province data, which does not match the label. | Checkout > Shipping Address | **Medium** | Use plain-language labels such as Street address, Apartment/unit, State/Province, and City. Populate each field from the matching data source. |
| 3. User control and freedom | The checkout payment action is implemented as a clickable `div`, not a real button. This weakens keyboard activation, focus behavior, and expected browser semantics. | Checkout > Go to Payment | **Medium** | Use a `<button type="button">`, expose disabled/loading state, and allow keyboard activation. Provide a clear Back to cart/edit address action. |
| 4. Consistency and standards | Terminology and spelling are inconsistent: seller/shop wording varies, `Coupouns` appears in route/component naming, and the login password label is lowercase while other labels use title case. Product prices display `$` while the backend/payment configuration uses INR. | Header, seller dashboard, login, product/payment screens | **Medium** | Establish a UI glossary and run a copy review. Correct visible spelling, use one seller/shop convention, and display the configured currency consistently across catalog, cart, checkout, and payment. |
| 5. Error prevention | Several checkout identity fields are required but appear read-only because they have a value without an editable change handler. A user with missing or outdated profile phone data may be unable to correct it before ordering. | Checkout > Shipping Address | **High** | Make profile-derived fields explicitly read-only with an Edit profile link, or make them editable and persist the update. Validate all fields before navigation and explain exactly what must be corrected. |
| 6. Recognition rather than recall | At smaller widths the main header exposes icon-only actions and dashboard sidebars hide text labels. Although some buttons have accessible names in code, visual users must infer icons and dashboard destinations. | Mobile header; seller/admin dashboard sidebars | **Medium** | Keep short visible labels or provide a labelled expanded drawer/tooltips. Mark the current dashboard destination with both text and a stronger visual state. |
| 7. Flexibility and efficiency of use | Search suggestions work, but submitting a search query does not filter the results page. The URL changes to `products?search=speaker`, while unrelated products remain visible. | Header search -> Products page | **High** | Read and apply the `search` query parameter in `ProductsPage`, show the active query and result count, and provide a clear-search control. Add filtering/sorting for experienced users. |
| 8. Aesthetic and minimalist design | The products screen is primarily an unlabeled grid. It lacks a visible page heading, active category/search context, result count, filter/sort controls, and a clear empty/loading explanation. | Products page | **Medium** | Add a concise heading such as `Products`, context text such as `Results for “speaker”`, result count, and compact filter/sort controls. Preserve whitespace without making the user infer the page state. |
| 9. Help users recognize, diagnose, and recover from errors | Coupon submission has no visible local loading/error boundary for network failures, and the unavailable-backend case produces raw runtime errors. Login has a better inline error pattern, but error handling is not consistent across flows. | Checkout coupon area; global data loading; login | **High** | Normalize API error handling, show actionable messages near the affected control, disable duplicate submissions while waiting, and offer Retry/Back actions. Log technical details separately from user-facing copy. |
| 10. Help and documentation | Login offers `Need help?`, but it links to the FAQ rather than a password-recovery flow. There is no visible Forgot password action in the login journey. | Login page and FAQ | **Medium** | Add a clearly labelled Forgot password link and recovery flow. Keep FAQ/help available for general questions and provide contact/support escalation for payment and order problems. |

## 4. Prioritized Usability Issue List

1. **High - Search produces misleading results:** the submitted search query is not applied to the products grid.
2. **High - Backend failure exposes uncaught runtime errors:** users receive technical error behavior instead of recovery guidance.
3. **High - Checkout profile fields may be uneditable:** missing or incorrect phone/name/email data can block a successful order.
4. **High - Inconsistent error handling:** coupon and data-loading failures do not consistently provide actionable feedback.
5. **Medium - Checkout language/data mismatch:** address labels do not match the actual fields/data.
6. **Medium - Weak keyboard semantics for payment action:** clickable `div` is used instead of a button.
7. **Medium - Mobile/dashboard recognition burden:** icon-only navigation and hidden labels require users to remember icon meanings.
8. **Medium - Products page lacks context and controls:** users cannot quickly understand or refine the current catalog view.
9. **Medium - Terminology, spelling, and currency inconsistency:** reduces trust and makes the system feel less predictable.
10. **Medium - No password-recovery entry point:** help does not directly support a common login failure.

## 5. Recommendations for Improvement

### Immediate fixes

- Fix the `search` query handling so search results match the submitted term.
- Add a reusable API error state with a Retry button and remove raw runtime overlays from production behavior.
- Convert checkout actions to semantic buttons and make profile-derived fields editable or clearly read-only with an Edit profile route.
- Add `try/catch` and loading states to coupon and other async form submissions.

### Short-term usability improvements

- Add Products page heading, result count, active search/category context, filter, sort, and clear controls.
- Review labels and vocabulary across buyer, seller, and admin screens; correct `Coupouns`, address labels, capitalization, and currency display.
- Keep navigation labels available in mobile and collapsed dashboard layouts, with tooltips as a supplement.
- Add Forgot password and clear checkout recovery paths.

### QA and accessibility follow-up

- Add automated tests for search filtering, API failure states, checkout field editability, keyboard activation, and empty results.
- Test at desktop, tablet, and mobile widths with keyboard-only navigation.
- Test with a screen reader and verify every icon-only action has a visible or programmatically associated name.
- Test payment, coupon, email activation, Google login, and chat with provider-enabled staging credentials.

## 6. Screenshots and Annotated Comments

Take the following screenshots for the Word document. Use the browser viewport shown in each item and add numbered arrows/callouts matching the comments below.

| Screenshot | What to capture | Annotation comments to place on the image |
|---|---|---|
| 1. Home page desktop | Top of `http://localhost:3000/` showing Vendora branding, search/header, hero, and category area | **A:** Main shopping entry point. **B:** Search and cart/wishlist actions. **C:** Category shortcuts. |
| 2. Products page desktop | `http://localhost:3000/products` showing the product grid | **A:** Product cards show price, discount, stock, and actions. **B:** No visible page title, result count, filter, or sort controls. |
| 3. Search defect | Submit `speaker` in the header and capture `http://localhost:3000/products?search=speaker` with unrelated products visible | **A:** Search query is present in the URL. **B:** Results are not filtered to “speaker”. **C:** This is a High-severity misleading-results issue. |
| 4. Product details | Open one product card and capture the product image, price, stock, quantity, wishlist, and Add to cart area | **A:** Primary purchase decision information. **B:** Check whether the Add to cart action and stock status are visually clear. |
| 5. Cart drawer | Add a product and open the cart drawer | **A:** Cart contents and quantity controls. **B:** Subtotal/checkout action. **C:** Check whether the drawer has a clear close control and empty-cart state. |
| 6. Login page | `/login` showing email/password fields, password visibility icon, Remember me, Need help, and Login | **A:** Inline validation/error area. **B:** Need help currently leads to FAQ rather than password recovery. **C:** Password label/copy consistency. |
| 7. Checkout shipping | `/checkout` with the Shipping Address form visible | **A:** Technical `Address1`/`Address2` labels. **B:** City/state data mismatch to verify visually. **C:** Identity fields that may not be editable. **D:** Go to Payment action. |
| 8. Failure state | Stop the backend temporarily or open the app while API is unavailable, then capture the visible error state | **A:** Technical runtime error/overlay. **B:** Missing friendly Retry or service-unavailable message. This supports the High-severity error-handling findings. |
| 9. Mobile home/header | Use a narrow mobile viewport and capture the header/menu/search/cart controls | **A:** Icon-only actions require recognition. **B:** Open the menu and capture the drawer if labels are visible or missing. |
| 10. Seller/admin dashboard | Use authorized credentials, open dashboard, and capture the collapsed/sidebar navigation | **A:** Text labels hidden at narrow widths. **B:** Active section indication. **C:** Check spelling/terminology such as Coupons and Withdraw requests. |

### Annotation convention

Use red callouts for defects, amber for usability risks, and green for correctly working areas. Put the severity in each defect callout, for example: `High - search query does not filter results`. Keep each screenshot caption in the Word document as `Figure N: [screen name] - [what the screenshot demonstrates]`.

## 7. Conclusion

Vendora has a broad and coherent marketplace feature set, with clear buyer, seller, and admin roles. The most important usability risks are not visual polish issues: search can produce misleading results, checkout can become difficult to complete when profile data is incomplete, and service failures expose technical errors without recovery guidance. Fixing those three areas first would improve task success and user trust more than a general visual redesign.
