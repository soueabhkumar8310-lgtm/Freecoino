# 📧 Vortex Support - API Key Request

## ❌ Problem: API Key Not Visible in Dashboard

Your placement details form doesn't show the API Key field, even though documentation says it should be there.

---

## ✅ How to Contact Vortex Support:

### Method 1: Dashboard Support (Recommended)
```
1. Vortex Dashboard → Look for "Support" or "Help" button
2. Usually in bottom-right corner (chat icon) or top-right menu
3. Send message (see template below)
```

### Method 2: Email Support
If no in-dashboard support found, email them directly:
```
To: support@vortexwall.com (or check dashboard for exact email)
Subject: Request API Key for REST API Integration
```

---

## 📝 Message Template (English):

```
Subject: Need API Key for REST API Integration

Hello Vortex Support Team,

I need to integrate the Vortex REST API into my website but cannot find the API key in my dashboard.

Account Details:
- Placement Name: Freecoino
- Placement ID: 6a45ffeebe991f606452e3a6
- Website: https://freecoino.com
- Email: souabhkumar8310@gmail.com

According to your API documentation (https://api.vortexwall.com/api/v1/offers/static), 
I need an API key to fetch offers server-side. However, I cannot locate the API key 
field in my placement details page.

Could you please:
1. Provide my API key, OR
2. Enable API access for my account, OR
3. Guide me to where I can find the API key in the dashboard

Integration Purpose:
I want to fetch your gaming offers programmatically and display them on my 
cryptocurrency rewards website alongside other offerwall providers.

Thank you for your assistance!

Best regards,
Souabh Kumar
https://freecoino.com
```

---

## 📝 Message Template (Hindi/Hinglish - Agar Support Hindi Support Karta Hai):

```
विषय: REST API के लिए API Key चाहिए

Hello,

मुझे अपनी website (freecoino.com) पर Vortex REST API integrate करनी है, 
लेकिन मुझे dashboard में API key नहीं मिल रही है।

मेरे Account की Details:
- Placement Name: Freecoino
- Placement ID: 6a45ffeebe991f606452e3a6
- Website: https://freecoino.com
- Email: souabhkumar8310@gmail.com

आपके API documentation के अनुसार, offers fetch करने के लिए API key चाहिए, 
लेकिन placement details page में API key field नहीं दिख रहा।

क्या आप मुझे:
1. मेरी API key provide कर सकते हैं, या
2. मेरे account के लिए API access enable कर सकते हैं, या
3. बता सकते हैं कि API key dashboard में कहाँ है

उद्देश्य: मैं आपके gaming offers को अपनी cryptocurrency rewards website 
पर दूसरे offerwalls के साथ display करना चाहता हूँ।

धन्यवाद!

Souabh Kumar
https://freecoino.com
```

---

## 🎯 What Information to Include:

### Required Info:
- ✅ Placement Name: **Freecoino**
- ✅ Placement ID: **6a45ffeebe991f606452e3a6**
- ✅ Website URL: **https://freecoino.com**
- ✅ Your Email: **souabhkumar8310@gmail.com**
- ✅ Purpose: REST API integration for gaming offers

### Optional (But Helpful):
- Account signup date (if you remember)
- Your integration plan (server-side offer fetching)
- Screenshot of placement details page (showing API key field missing)

---

## ⏱️ Expected Response Time:

Most offerwall support teams respond within:
- **Chat Support**: Few minutes to few hours
- **Email Support**: 24-48 hours
- **Ticket System**: 1-2 business days

---

## 🔄 Meanwhile - Alternative Options:

While waiting for API key, you can still use **Vortex Iframe** (already working on your site!):

### Current Working Setup:
```javascript
// Vortex iframe already integrated in earn-content.tsx
<iframe 
  src="https://vortexwall.com/ow/6a45ffeebe991f606452e3a6/{userId}"
  style="width: 100%; height: 100%; border: none;"
/>
```

**Iframe is live at:** https://freecoino.com/earn → Vortex tab

Users can see and complete Vortex offers through iframe while you wait for API key!

---

## 📊 Current Offerwall Status:

| Offerwall | Gaming Offers (API) | Iframe Tab | Status |
|-----------|---------------------|------------|--------|
| Revtoo | ✅ ~1454 offers | ✅ Working | ✅ Complete |
| Gemiad | ⚠️ Needs API key | ✅ Working | ⚠️ API pending |
| Notik | ❌ Cloudflare block | ✅ Working | ✅ Iframe only |
| Vortex | ⚠️ **Needs API key** | ✅ **Working** | ⚠️ **API pending** |
| KLink/CPX | ✅ Working | ✅ Working | ✅ Complete |
| Timewall | ✅ Working | ✅ Working | ✅ Complete |

**Note:** Vortex iframe already live and working! API key will just add more offers to Gaming Offers section.

---

## ✅ After Getting API Key:

Once Vortex support provides API key:

### Step 1: Add to Vercel
```bash
1. Vercel Dashboard → freecoino project
2. Settings → Environment Variables
3. Add new variable:
   Name: VORTEX_API_KEY
   Value: [API key from support]
   Environment: Production, Preview, Development (all 3)
4. Save
```

### Step 2: Test API
```bash
# Test endpoint (optional - to verify key works)
curl "https://api.vortexwall.com/api/v1/offers/static?placementId=6a45ffeebe991f606452e3a6&apiKey=YOUR_KEY"
```

### Step 3: Deploy & Verify
```bash
# Auto redeploy after env var added
# Check Gaming Offers section on freecoino.com/earn
# Should see 100-200 new Vortex offers!
```

---

## 🆘 If Support Doesn't Respond:

### Alternate Contact Methods:
1. **Twitter/X**: Search "@VortexWall" and DM them
2. **LinkedIn**: Search "Vortex Offerwall" company page
3. **Dashboard Profile**: Check if there's a support ticket system
4. **Publisher Portal**: Look for "Contact" or "Help" section

### If No Response After 3-4 Days:
- Use Vortex iframe only (already working perfectly!)
- Focus on other offerwalls (Revtoo, KLink, Timewall all working)
- Try again after 1 week with follow-up email

---

## 📞 Where to Find Support in Dashboard:

Common locations for support in publisher dashboards:

### Bottom-Right Corner:
```
Look for floating chat icon/bubble
Usually has "Help", "Support", or "Chat" text
```

### Top-Right Menu:
```
Click your profile/avatar
Look for:
- Help Center
- Support
- Contact Us
- Documentation
```

### Left Sidebar:
```
Scroll to bottom
Look for:
- Support (with headphone icon)
- Help
- Contact
```

---

## 🎉 Good News:

Even without Vortex API key, aapki site **5 offerwalls se offers show kar rahi hai**:
1. ✅ Revtoo - 1454 offers (REST API)
2. ✅ KLink/CPX - Working (REST API)
3. ✅ Timewall - Working (Iframe)
4. ✅ Notik - Working (Iframe)
5. ✅ Vortex - Working (Iframe)

**Vortex API key milne se:** Gaming Offers section mein 100-200 more Vortex offers add ho jayenge! 🚀

---

**Next Steps:**
1. ⬜ Dashboard mein Support/Help button dhundo
2. ⬜ Message bhejo (English template use karo)
3. ⬜ Wait for response (24-48 hours)
4. ⬜ API key milte hi Vercel mein add karo
5. ⬜ Test karo Gaming Offers section

**Support contact karte hi mujhe batao, main next steps guide karunga!** 😊
