# DoAura — Initial Mobile UI/UX Design

Design the initial mobile UI/UX for **DoAura**, a skilled-worker marketplace that connects **Hirers** with **Workers** such as plumbers, electricians, gardeners, cleaners, painters, carpenters, handymen, and other service professionals.

Do NOT design this as a car/ride-hailing application.

The product can use an **inDrive-style real-time bidding interaction**, but the overall design must feel like a premium **home/local-services marketplace**.

---

## 1. USER TYPES

There are two completely different user experiences:

### Hirer

A customer who creates jobs and hires workers.

### Worker

A skilled professional who receives nearby jobs, bids on them, gets assigned jobs, performs the work, and receives payment.

The app should make it very clear which experience the user is currently using.

---

# 2. DESIGN DIRECTION

Create a modern, premium, trustworthy mobile application.

### Visual style

* Mobile-first
* Clean and modern
* Premium marketplace feel
* Friendly but professional
* Large touch targets
* Rounded cards
* Bottom sheets
* Floating elements where appropriate
* Subtle shadows
* Smooth micro-interactions
* Clear status indicators
* Excellent empty/loading/error states
* Strong typography hierarchy
* Simple modern line icons
* Minimal visual clutter

### Brand

Use DoAura branding with:

* Primary: `#10B981`
* Deep teal/green supporting colors
* White backgrounds
* Very light green/neutral surfaces
* Dark charcoal text
* Green used for primary actions and positive states

Do not overuse gradients.

Do not make the interface look like a generic admin dashboard.

Do not make the interface look like Uber/inDrive.

The inspiration should be:

**Modern service marketplace + premium mobile fintech usability + location-aware booking + real-time worker bidding.**

---

# 3. IMPORTANT PRODUCT PRINCIPLE

The entire application should revolve around:

**Discover → Create Job → Find Workers → Receive Bids → Assign Worker → Communicate → Complete Job → Confirm Payment → Rate**

For Workers:

**Go Online → Receive Jobs → Review Job → Bid → Get Assigned → Navigate/Contact Hirer → Work → Confirm Job → Payment → Complete**

Make these workflows extremely obvious through the UI.

---

# 4. WORKER EXPERIENCE

## Worker Registration

If a worker is not registered:

### Screen 1 — Welcome

DoAura branding.

Actions:

* Login
* Become a Worker

Explain:

"Earn by providing your skills to people near you."

---

### Screen 2 — Basic Information

Collect:

* Name
* Email
* Phone
* Password or authentication method
* Basic profile information

Primary CTA:

**Continue**

---

### Screen 3 — OTP Verification

Show:

* Phone/email being verified
* OTP input
* Resend OTP
* Countdown
* Change phone/email

Keep this screen extremely simple.

---

### Screen 4 — Verification Documents

Allow worker to provide required verification documents.

Examples:

* Identity document
* Driving licence where applicable
* Other required verification documents

Show:

* Upload document
* Document type
* Verification status
* Pending / Verified / Rejected

Do not make this screen visually overwhelming.

---

### Screen 5 — Select Skills

This is an important screen.

Worker selects:

### Category

Examples:

* Plumbing
* Electrical
* Gardening
* Cleaning
* Painting
* Carpentry
* Handyman

Then select relevant **subcategories**.

Each skill/subcategory should have a clear selection component.

Example:

```text
Plumbing

☑ Pipe Repair
☐ Bathroom Plumbing
☐ Water Tank Installation
☐ Drain Cleaning
```

---

### Worker Tool Selection

For every selected skill/subcategory, provide:

**"Do you have the required tools?"**

Example:

```text
Pipe Repair

Required tools

🔧 Pipe Wrench
☑ I have this tool

🔧 Adjustable Wrench
☑ I have this tool

🛠 Pipe Cutter
☐ I don't have this tool
```

Make this visually simple and easy to update later from the Worker Profile.

---

# 5. WORKER HOME / DASHBOARD

The Worker dashboard is one of the most important screens.

At the top:

```text
Good morning, Ahmad 👋

[ OFFLINE ]
```

The online/offline toggle must be highly visible.

### When OFFLINE

Show:

* Not receiving jobs
* Go Online CTA
* Today's earnings
* Completed jobs
* Upcoming jobs

### When ONLINE

Show:

* "You're Online"
* Nearby available jobs
* Active job
* Earnings
* Current availability

Dashboard sections:

### Earnings

```text
Today's Earnings
Rs 4,500

This Week
Rs 21,300
```

### Available Jobs

Show nearby jobs as cards.

### Active Job

If assigned:

Show the current job prominently.

### Quick Actions

* Available Jobs
* Active Job
* Earnings
* Messages
* Profile

---

# 6. WORKER ONLINE/OFFLINE EXPERIENCE

The Online toggle should have a strong visual state.

OFFLINE:

```text
You're Offline

You won't receive new job requests.

[ Go Online ]
```

ONLINE:

```text
You're Online

Looking for jobs near you...

[ Go Offline ]
```

Use subtle animation when switching states.

---

# 7. NEW JOB NOTIFICATION

When a new nearby job becomes available:

Show a strong real-time notification.

Example:

```text
NEW JOB NEAR YOU

Garden Maintenance

📍 1.8 km away

Estimated duration
3 hours

Required tools
✓ Yes

Payment
Rs 1,500/hr

[ View Job ]
```

The worker should be able to open the job immediately.

---

# 8. WORKER JOB DETAIL / BIDDING

This is the most important Worker interaction.

Use a **bottom-sheet + map** experience.

Map:

* Job location
* Worker's location
* Distance
* Approximate route

Bottom sheet:

```text
Garden Maintenance

📍 1.8 km away

3 hours
Gardening
Tools required

Description:
Need lawn maintenance and trimming...

Hirer:
Ahmed Khan
⭐ 4.8

Estimated market price:
Rs 1,200 – 1,800/hr
```

Then:

```text
Your Bid

Rs 1,500 / hour

[-]       [+]
```

CTA:

**Place Bid**

---

# 9. BIDDING SYSTEM

The interaction should feel inspired by inDrive but adapted to DoAura.

Workers can:

* Place bid
* Reject job
* View job details
* See current bidding state

If their bid is rejected and the job is still unassigned:

Show:

```text
Your previous bid was rejected.

This job is still available.

You can submit a new bid.

[ Re-Bid ]
```

Do not hide the job immediately.

Clearly show:

* Previous bid
* New bid
* Job status
* Time remaining if applicable

---

# 10. JOB ASSIGNED TO WORKER

When the hirer accepts the worker's bid:

Show a clear success state:

```text
Job Assigned 🎉

You have been selected for this job.

Friday
10:00 AM

Garden Maintenance

📍 Location

[ View Job ]

[ Message Hirer ]
```

The worker can now access:

* Full location
* Hirer details
* Job description
* Required tools
* Schedule
* Payment information
* Messages

---

# 11. WORKER JOB SECTION

Create a dedicated Jobs section.

Tabs:

```text
Open | Active | Completed
```

### Open

Available jobs the worker can bid on.

### Active

Assigned/current jobs.

### Completed

Historical jobs.

Each job should show:

* Category
* Subcategory
* Location
* Date/time
* Duration
* Bid/payment
* Status

---

# 12. ACTIVE WORKER JOB

Use a clear status progression:

```text
Assigned
   ↓
On the Way
   ↓
Arrived
   ↓
Work Started
   ↓
Work Completed
   ↓
Payment Confirmed
   ↓
Completed
```

Worker can change status through clear primary actions.

Example:

```text
Garden Maintenance

Friday · 10:00 AM

[ Navigate ]

[ Message Hirer ]

Current Status

Assigned

[ I'm On My Way ]
```

Then dynamically change the CTA depending on status.

---

# 13. WORKER JOB COMPLETION

After work is finished:

Show:

### Confirm Job

* Completed job checklist
* Work completed confirmation
* Optional photos
* Final amount
* Payment status

Then:

**Mark Job as Completed**

After completion:

* Confirm payment
* Show earnings
* Show rating/review
* Move job to Completed

---

# 14. WORKER MESSAGES

Every active job should have direct messaging.

Message screen should be job-specific.

Header:

```text
Garden Maintenance
Ahmed Khan
```

Include:

* Text messages
* Image attachment if needed
* Job reference
* Quick actions

Do not create confusing global conversations when the conversation belongs to a specific job.

---

# 15. WORKER PROFILE

Profile should include:

### Personal information

* Profile photo
* Name
* Rating
* Completed jobs
* Verification status

### Skills

Categories + subcategories.

Example:

```text
Gardening

✓ Lawn Maintenance
✓ Tree Trimming
✓ Garden Cleaning
```

### Tools

Show which tools the worker owns.

### Documents

Show verification status.

### Earnings

Quick access.

### Availability

Online/offline settings.

---

# 16. HIRER REGISTRATION

### Screen 1

Basic information:

* Name
* Email
* Phone
* Password/authentication

### Screen 2

OTP verification.

After successful registration:

**Go directly to Hirer Dashboard.**

Do not force unnecessary onboarding.

---

# 17. HIRER FIRST-TIME LOCATION

On first app launch:

Ask for location permission.

Explain why:

"Allow location access to find trusted professionals near you."

If permission is denied, provide manual location selection.

The Hirer should also be able to choose the location where the work will actually happen.

Important:

**The user's current location and the job location are not necessarily the same.**

---

# 18. HIRER DASHBOARD

Create a visually rich but simple home screen.

Top:

```text
Good morning 👋

📍 Work location
Islamabad, Pakistan

🔍 What service do you need?
```

Then:

### Flash Sale / Promotions

A horizontal promotional card.

### Categories

Use attractive service icons.

Example:

```text
🔧 Plumbing
⚡ Electrical
🌱 Gardening
🧹 Cleaning
🎨 Painting
🪚 Carpentry
🔨 Handyman
```

### Popular Services

Show frequently booked services.

### Active Jobs

If the Hirer has an active job, show it prominently.

### Recent Jobs

Show recent activity.

---

# 19. CREATE JOB

The main CTA should be:

**Add Job / Create Job**

The Hirer can also start by selecting a category directly.

---

# 20. CATEGORY → SUBCATEGORY

Flow:

```text
Category
   ↓
Subcategory
   ↓
Quantity / Hours
   ↓
Location
   ↓
Tools
   ↓
Description
   ↓
Photos
   ↓
Date & Time
   ↓
Payment Type
   ↓
Review
   ↓
Post Job
```

---

# 21. SELECT SERVICE

Example:

```text
Gardening

Select service

○ Lawn Maintenance
○ Tree Trimming
○ Garden Cleanup
○ Planting
```

Then:

### Duration

Default:

**1 hour**

Allow:

* 1 hour
* 2 hours
* 3 hours
* Custom

---

# 22. JOB DETAILS

Collect:

### Location

Confirm exact work location.

Show map and address.

### Required Tools

Checkbox:

**Worker must bring tools**

or

**Tools will be provided**

### Description

Large text area.

### Photos

Allow multiple images.

Example:

"Upload photos to help workers understand the job."

---

# 23. DATE & TIME

Allow Hirer to select:

* Starting date
* Starting time
* Time slot
* Duration

Make scheduling visually simple.

---

# 24. PAYMENT TYPE

Two options:

### Hourly

Example:

```text
Estimated rate

Rs 1,200 / hour

Duration
3 hours

Estimated total
Rs 3,600
```

### Fixed Price

Example:

```text
Fixed Job Price

Rs 5,000
```

The hourly prices should come from the admin-configured price for the selected subcategory.

Clearly distinguish:

**Estimated price vs final agreed price.**

---

# 25. REVIEW & POST JOB

Before posting:

Show a complete summary:

```text
Garden Maintenance

📍 Islamabad
📅 Friday, 10:00 AM
⏱ 3 hours

Tools required
Yes

Payment
Hourly

Estimated rate
Rs 1,200/hr

Description
...

Photos
3

[ Edit ]

[ Post Job ]
```

---

# 26. HIRER FINDING WORKERS

After posting a job:

Show a **map-first worker discovery screen**.

Map should show nearby workers.

Worker markers can show:

* Profile photo
* Skill icon
* Distance
* Availability

Bottom sheet should show the job and incoming bids.

Example:

```text
5 Workers Interested

Garden Maintenance

3 hours
Islamabad

────────────────

Ahmad Khan
⭐ 4.9
1.2 km away

Rs 1,400/hr

[ Reject ] [ Accept ]

────────────────

Ali Raza
⭐ 4.8
2.1 km away

Rs 1,300/hr

[ Reject ] [ Accept ]
```

---

# 27. HIRER BIDDING EXPERIENCE

Make this one of the signature DoAura experiences.

The Hirer should be able to:

* See worker bids in real time
* See worker rating
* See distance
* See completed jobs
* See skills
* See tools
* See bid amount
* Reject bid
* Accept bid

If rejected, remove the bid visually but keep the job active.

If no worker has been assigned, continue showing incoming bids.

---

# 28. ACCEPT WORKER

When Hirer accepts:

Show confirmation:

```text
Confirm Worker

Ahmad Khan
⭐ 4.9
127 completed jobs

Garden Maintenance

Rs 1,400/hr
3 hours

Estimated total
Rs 4,200

[ Confirm & Continue ]
```

Then ask/confirm payment method.

After confirmation:

**Job Assigned**

---

# 29. ACTIVE HIRER JOB

The active job should appear prominently on the dashboard.

Show:

```text
Garden Maintenance

Worker
Ahmad Khan
⭐ 4.9

Status
On the Way

ETA
12 min

[ Message ]
[ Call ]

[ View Job ]
```

Use map when location tracking is relevant.

---

# 30. HIRER JOB DETAIL

Show:

* Worker profile
* Worker skills
* Rating
* Job location
* Schedule
* Job description
* Photos
* Agreed price
* Payment method
* Status
* Messages
* Support

---

# 31. COMPLETION

After worker marks work completed:

Hirer sees:

```text
Job Completed

Garden Maintenance

Worker:
Ahmad Khan

Agreed amount:
Rs 4,200

Payment:
Confirmed

[ Confirm Completion ]
```

Then:

### Rate Worker

* 1–5 stars
* Optional review
* Report issue

---

# 32. HIRER NAVIGATION

Recommended bottom navigation:

```text
Home
Jobs
Messages
Activity
Profile
```

Keep **Create Job** as a prominent floating/central action where appropriate.

---

# 33. WORKER NAVIGATION

Recommended:

```text
Home
Jobs
Messages
Earnings
Profile
```

The Online/Offline switch should remain easily accessible from Home.

---

# 34. IMPORTANT STATES TO DESIGN

Do not design only the happy path.

Create UI for:

* Empty state
* Loading
* Skeleton loading
* No nearby workers
* No available jobs
* Job rejected
* Bid rejected
* Job cancelled
* Worker unavailable
* Hirer unavailable
* Payment pending
* Payment failed
* Worker verification pending
* Worker verification rejected
* Location permission denied
* Notification permission denied
* Network disconnected
* Job expired
* No bids received
* Multiple bids received
* Worker accepted
* Worker rejected
* Job completed
* Dispute/report issue

---

# 35. COMPONENT SYSTEM

Create reusable components rather than designing every screen independently.

Important components:

* App header
* Bottom navigation
* Service category card
* Subcategory selector
* Worker card
* Worker bid card
* Job card
* Job status component
* Map component
* Bottom sheet
* Price/bid component
* Rating component
* Location selector
* Date/time selector
* Image uploader
* Tool selector
* Skill selector
* Status badge
* Earnings card
* Payment card
* Notification card
* Empty state
* Confirmation modal
* OTP input
* Online/offline switch

---

# 36. DESIGN CONSISTENCY

Create a reusable design system:

### Typography

Use a modern readable sans-serif.

Define:

* Display
* Heading
* Subheading
* Body
* Caption
* Button

### Spacing

Use a consistent spacing system.

### Radius

Use consistent rounded corners.

### Colors

Define:

* Primary
* Primary light
* Success
* Warning
* Error
* Info
* Background
* Surface
* Border
* Text

### Components

Every component should have:

* Default
* Active
* Disabled
* Loading
* Error
* Success states

---

# 37. MAP + BOTTOM SHEET PRINCIPLE

DoAura should use maps only when location is important.

Do not make every screen map-based.

Use:

**Map + Bottom Sheet**

for:

* Finding nearby workers
* Worker receiving nearby jobs
* Active job tracking
* Location selection

Use normal mobile UI for:

* Profile
* Skills
* Earnings
* Settings
* Registration
* Job history
* Documents

---

# 38. MICROINTERACTIONS

Use subtle animations for:

* Online/offline toggle
* New job arrival
* New bid
* Bid accepted
* Worker assigned
* Job status change
* Payment confirmed
* Rating submitted

Example:

When a new worker bid arrives, the bid card should gently animate into the list rather than abruptly appearing.

---

# 39. DO NOT IMPLEMENT THE BACKEND

At this stage, focus on the **initial UI/UX design and user experience**.

Do not change backend architecture.

Do not create unnecessary APIs.

Do not invent business rules that are not described above.

Where business logic is required but undefined, structure the UI so it can easily support the future logic.

---

# 40. FINAL DESIGN GOAL

The final DoAura experience should communicate:

**"Find the right professional for your job, agree on a price, communicate directly, and get the job done."**

The product should feel:

**Trusted + Local + Professional + Fast + Simple + Transparent**

The bidding system is inspired by inDrive, but DoAura's identity must clearly be a **professional services marketplace**, not a transportation application.

Before designing individual screens, establish the complete information architecture, navigation structure, reusable component system, and visual design language so both Hirer and Worker experiences feel like the same product.
