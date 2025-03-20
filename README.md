## **Paystack Transaction**

🎯 Final Workflow
1️⃣ Frontend calls /pay/womaye-gsp → Backend initializes payment & returns authorization URL.
2️⃣ Frontend redirects user to Paystack checkout page.
3️⃣ User completes payment, Paystack redirects back with a reference.
4️⃣ Frontend extracts reference & calls /pay/verify/:reference to check payment status.
5️⃣ Backend verifies payment using Paystack API & notifies frontend.

---

Use JWT Authentication Instead of API Keys (For Users)

- If you need user authentication, use JWT (JSON Web Tokens) instead of an API key.
- Users log in, receive a JWT token, and send it in requests.
- The backend verifies the JWT before allowing access.

Great! Setting up **Paystack webhooks** will allow your backend to receive automatic notifications about payment events (successful, failed, refunded, etc.), even if the user doesn’t return to your website.

---

## ✅ **How to Set Up Paystack Webhooks to Handle Failed Payments**

### **1️⃣ Create the Webhook Route in Your Backend**

Paystack will send a **POST request** to your webhook URL with payment event details. You need to handle it.

#### **Webhook Handler (`index.js`)**

```javascript
app.post("/pay/webhook", express.json(), (req, res) => {
  const event = req.body;

  // Verify Paystack sent this request (security check)
  const paystackSignature = req.headers["x-paystack-signature"];
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(event))
    .digest("hex");

  if (hash !== paystackSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  console.log("Received webhook event:", event);

  // Handle different payment statuses
  if (event.event === "charge.success") {
    console.log("Payment successful:", event.data.reference);
    // TODO: Update user payment status in the database
  } else if (event.event === "charge.failed") {
    console.log("Payment failed:", event.data.reference);
    // TODO: Handle failed payments (e.g., notify user)
  }

  res.status(200).send("Webhook received successfully");
});
```

---

### **2️⃣ Add Your Webhook URL in Paystack Dashboard**

1. **Go to Paystack Dashboard** → Click **Settings** → Click **API Keys & Webhooks**.
2. Under **Webhook URL**, enter:
   ```
   https://yourdomain.com/pay/webhook
   ```
   _(Replace `yourdomain.com` with your actual backend domain.)_
3. Click **Save**.

---

### **3️⃣ Testing the Webhook Locally (Optional)**

Since Paystack cannot call `localhost`, you need a tool like [ngrok](https://ngrok.com/) to expose your local server.

#### **Expose Localhost Using ngrok**

1. **Install ngrok** (if not installed):
   ```bash
   npm install -g ngrok
   ```
2. **Run ngrok to expose port 3000**:
   ```bash
   ngrok http 3000
   ```
3. Copy the **https://your-ngrok-url.ngrok.io** URL and set it as your webhook URL in Paystack.

---

### **4️⃣ Handling Failed Payments**

When a **failed payment** event is received:

- Store it in the database.
- Notify the user via email or push notification.
- Optionally, retry the payment or prompt the user.

#### **Example: Notify User on Payment Failure**

Modify the webhook handler:

```javascript
const sendEmail = require("./utils/sendEmail"); // Import your email function

app.post("/pay/webhook", express.json(), async (req, res) => {
  const event = req.body;
  const paystackSignature = req.headers["x-paystack-signature"];
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(event))
    .digest("hex");

  if (hash !== paystackSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  if (event.event === "charge.failed") {
    console.log("Payment failed:", event.data.reference);

    // Notify user about failed payment
    await sendEmail({
      to: event.data.customer.email,
      subject: "Payment Failed",
      text: `Your payment with reference ${event.data.reference} failed. Please try again.`,
    });

    // TODO: Store failed payment attempt in the database
  }

  res.status(200).send("Webhook processed");
});
```

---

### 🚀 **Final Flow with Webhooks**

1️⃣ User tries to pay → Paystack processes payment.  
2️⃣ Paystack calls `/pay/webhook` with payment status.  
3️⃣ If **successful**, update user’s payment record.  
4️⃣ If **failed**, store the failed attempt and notify the user.  
5️⃣ Webhooks ensure payment failures are handled **even if the user doesn’t return to your site**.

---

### 🔥 **Security Best Practices**

✅ **Always validate the `x-paystack-signature`** before processing the request.  
✅ **Use HTTPS** for your webhook URL in production.  
✅ **Store all webhook events in a database** for debugging.

---

Do you also want an **automatic retry system** for failed payments? 🚀

---

## **Array**

(method) Array<any>.some(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean
Determines whether the specified callback function returns true for any element of an array.

@param predicate
A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.

@param thisArg
An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.

---

## **Crypto**

Generates cryptographically strong pseudorandom data. The size argument is a number indicating the number of bytes to generate.

If a callback function is provided, the bytes are generated asynchronously and the callback function is invoked with two arguments: err and buf. If an error occurs, err will be an Error object; otherwise it is null. The buf argument is a Buffer containing the generated bytes.

// Asynchronous
const {
randomBytes,
} = await import('node:crypto');

randomBytes(256, (err, buf) => {
if (err) throw err;
console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
});
If the callback function is not provided, the random bytes are generated synchronously and returned as a Buffer. An error will be thrown if there is a problem generating the bytes.

// Synchronous
const {
randomBytes,
} = await import('node:crypto');

const buf = randomBytes(256);
console.log(
`${buf.length} bytes of random data: ${buf.toString('hex')}`);
The crypto.randomBytes() method will not complete until there is sufficient entropy available. This should normally never take longer than a few milliseconds. The only time when generating the random bytes may conceivably block for a longer period of time is right after boot, when the whole system is still low on entropy.

This API uses libuv's threadpool, which can have surprising and negative performance implications for some applications; see the UV_THREADPOOL_SIZE documentation for more information.

The asynchronous version of crypto.randomBytes() is carried out in a single threadpool request. To minimize threadpool task length variation, partition large randomBytes requests when doing so as part of fulfilling a client request.

@since — v0.5.8

@param size — The number of bytes to generate. The size must not be larger than 2\*\*31 - 1.

@return — if the callback function is not provided.

## ** Admin Access Key Request Logic**

<!-- Permission Request -->

- on request for permission from admin
- let key_code = null
- const new_key = generate 6 random digit access code
- create key_obj = {id:`${new Date()}`, key:new_key}
- key_code = key_obj

<!-- The logic behind: -->

```javascript
const keyObj = { id: `${Date.now()}`, key: newKey };
accessKeys.push(keyObj);

accessExpiry[keyObj.id] = Date.now() + 50 * 1000;
```

### Explanation:

1. **Create a Unique Key Object (`keyObj`)**

   - The `id` is generated using `Date.now()`, which provides a timestamp (milliseconds since 1970).
   - The `key` is assigned a newly generated 6-digit access code (`newKey`).
   - This ensures each key object has a unique identifier (`id`) and an associated access key (`key`).

2. **Store the Key Object (`accessKeys.push(keyObj)`)**

   - The new `keyObj` is added to the `accessKeys` array, allowing access keys to be referenced when needed.

3. **Set Expiration Time (`accessExpiry[keyObj.id] = Date.now() + 50 * 1000`)**
   - The key’s expiration time is stored in `accessExpiry` with the same `id` as the key.
   - `Date.now() + 50 * 1000` sets an expiry time 50 seconds into the future.
   - This allows the system to later remove expired keys when `removeExpiredKeys()` runs.

This mechanism ensures that:

- Each access key has a unique identifier (`id`).
- Access keys expire automatically after 50 seconds.
- A cleanup process (`removeExpiredKeys()`) periodically removes expired keys.
  periodically removes expired keys.

- access_keys = [...access_keys, new_key]
- permission_from: "admin1", "admin2"
- if permission_from === "admin1"
- return admin1's email_address
- send access code to admin's email_address for access

<!-- Remove Expired Keys -->

- Checks if a key exists(accessExpiry[key.id]) and has expired(accessExpiry[key.id] < now)
- If expired delete the key from accessExpiry (delete accessExpiry[key.id]) obj and takeout the key from accessKey, Array.filter => (return false)
- Else return

## ** Session tokens **

- A new session token is generated and stored in sessionTokens.

- The sessionExpiry object stores the expiration timestamp for that token.

- A cleanup function (removeExpiredSessions) runs every 60 seconds to remove expired tokens.

- When a user tries to validate a session, the system checks:
  > If the token exists in sessionTokens.
  > If its expiration time (stored in sessionExpiry) is still valid.
  > If expired, the token is removed.
  > This ensures that session tokens expire automatically after 10 minutes, keeping the system secure and scalable.

1. Current Feasibility:

- Each request generates a unique session token, stored in sessionTokens and linked to its expiration time in sessionExpiry.

- Cleanup runs every 60 seconds to remove expired tokens, preventing memory leaks.

- Each request is independent, meaning multiple users can request access and get unique tokens.

## **Hash map for session tokens **

Use an object (hash map) for faster lookups.

```javascript
let sessionTokens = {}; // Store session tokens as keys instead of an array
```

✅ This makes checking token validity **O(1) (constant time)** instead of **O(n) (linear time)**.

Modify how tokens are added:

```javascript
sessionTokens[sessionToken] = true;
sessionExpiry[sessionToken] = Date.now() + 10 * 60 * 1000;
```

Modify how sessions are validated:

```javascript
if (sessionTokens[session_token] && sessionExpiry[session_token] > Date.now()) {
  return res.json({ message: "success" });
}
```

---

#### **(b) More Efficient Expiration Handling**

Right now, expired tokens are **only removed every 60 seconds**, meaning a user with an expired token might still appear "valid" for up to 60 seconds.

🔹 **Solution:** Instead of just filtering expired tokens every 60 seconds, **remove them immediately upon checking**.
Modify `/check-session`:

```javascript
if (
  !sessionTokens[session_token] ||
  sessionExpiry[session_token] < Date.now()
) {
  delete sessionTokens[session_token];
  delete sessionExpiry[session_token];
  return res.status(400).json({ error: "Invalid session token" });
}
```

✅ This ensures expired tokens are removed as soon as they are detected.

---

#### **(c) Session Storage Scalability**

Currently, session tokens exist **only in memory** (`sessionTokens` and `sessionExpiry` objects), which means:

- Sessions are **lost when the server restarts**.
- Not scalable for **multiple servers** (sessions aren't shared).

🔹 **Solution:**

- Use **Redis** (ideal for caching and fast lookups).
- Use **a database** (e.g., PostgreSQL or MongoDB) if long-term storage is needed.

For **Redis-based session storage**:

1. Store session tokens using `SETEX` (which automatically expires the token).

```javascript
redisClient.setex(sessionToken, 600, "active"); // 600 seconds (10 min)
```

2. Check session:

```javascript
redisClient.get(session_token, (err, data) => {
  if (err || !data) {
    return res.status(400).json({ error: "Invalid session token" });
  }
  return res.json({ message: "success" });
});
```

✅ **Advantages:**

- Faster than memory storage.
- Works across multiple server instances.

---

### **Final Verdict:**

🚀 **Yes, your current implementation works for multiple users, but it can be optimized for better performance and scalability using:**  
✅ Hash map (`sessionTokens` as an object instead of an array).  
✅ Immediate expiration cleanup.  
✅ Persistent session storage (e.g., Redis).

Would you like help implementing Redis or another improvement? 🚀

---
