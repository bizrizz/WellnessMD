# WellnessMD Backend Test Coverage Report

## Purpose of this report

This document explains what parts of the WellnessMD backend were tested, what each feature is supposed to do, and what the testing showed.

The goal of this testing was to confirm that the current backend is working before adding any new functionality. Instead of focusing on technical implementation details, this report focuses on **what the backend is responsible for**, **how each feature was checked**, and **what currently works**.

This report is written so that both technical and non-technical team members can understand the current state of the backend.

---

## Overall result

The backend testing showed that the main core features of WellnessMD are working.

This includes:

- account creation and login
- automatic creation of user profiles
- profile viewing and profile updates
- access to wellness activities
- mood tracking
- activity completion tracking
- access to wellness resources
- forum posting
- commenting on forum posts
- liking forum posts
- push notification token storage
- protection of private user data

One area that was intentionally removed from scope was the **reports** functionality for forum moderation. Since that table has now been deleted, it is no longer included in this test coverage report.

---

## What was tested

### 1. Public wellness activity library

**Purpose:**  
The app includes a set of wellness activities such as breathing, stretching, and meditation sessions. These need to be available for users to view.

**What was tested:**  
We checked that the backend returns the list of existing wellness interventions.

**What this confirms:**  
The backend is successfully storing and serving the current activity library.

**Result:**  
Passed.

---

### 2. User account creation

**Purpose:**  
A new user needs to be able to create an account in order to use the app.

**What was tested:**  
Two separate test users were created to simulate real user sign-up.

**What this confirms:**  
The backend can successfully register new users.

**Result:**  
Passed.

---

### 3. User login

**Purpose:**  
Existing users need to be able to sign in and access their own data.

**What was tested:**  
Both test accounts were used to log in after sign-up.

**What this confirms:**  
The backend can successfully authenticate existing users and create active login sessions.

**Result:**  
Passed.

---

### 4. Automatic profile creation after sign-up

**Purpose:**  
When a user signs up, the app should automatically create a matching profile for them in the database. This profile holds app-specific information such as their name, training year, specialty, and settings.

**What was tested:**  
After sign-up, each test user’s profile was fetched from the backend.

**What this confirms:**  
A profile is automatically created for each new user without needing a separate manual setup step.

**Result:**  
Passed.

---

### 5. Viewing your own profile

**Purpose:**  
Each user should be able to see their own stored profile information.

**What was tested:**  
Each test user retrieved their own profile.

**What this confirms:**  
The backend correctly stores and returns profile information for the signed-in user.

**Result:**  
Passed.

---

### 6. Updating profile information

**Purpose:**  
Users need to be able to update their own information and preferences over time.

**What was tested:**  
One test user updated their profile details, including name, specialty, onboarding status, available time, and reminder preferences.

**What this confirms:**  
The backend supports profile editing and saves those updates correctly.

**Result:**  
Passed.

---

### 7. Access to interventions while signed in

**Purpose:**  
Users should still be able to access the wellness activity library while logged in.

**What was tested:**  
The signed-in user fetched the list of wellness interventions.

**What this confirms:**  
The intervention library works properly both as shared content and while inside the authenticated app experience.

**Result:**  
Passed.

---

### 8. Mood tracking

**Purpose:**  
Users can record their mood as part of their daily wellness check-in.

**What was tested:**  
A signed-in test user submitted a mood entry and then retrieved their mood history.

**What this confirms:**  
The backend can store mood entries and return them correctly for the user who created them.

**Result:**  
Passed.

---

### 9. Activity completion tracking

**Purpose:**  
When a user completes a wellness activity, the app should log that completion so it can support progress tracking, analytics, and streak-related features.

**What was tested:**  
A signed-in test user logged completion of a wellness intervention and then retrieved their activity history.

**What this confirms:**  
The backend correctly records completed activities and stores the related information needed for tracking usage.

**Result:**  
Passed.

---

### 10. Wellness resources library

**Purpose:**  
The app includes a collection of support resources such as mental health, nutrition, spiritual care, and institutional support information.

**What was tested:**  
A signed-in user retrieved the full list of available resources.

**What this confirms:**  
The backend is storing and delivering the resource library correctly.

**Result:**  
Passed.

---

### 11. Community forum post creation

**Purpose:**  
Users need to be able to create posts in the community forum.

**What was tested:**  
A signed-in user created a new forum post.

**What this confirms:**  
The backend supports creation of community posts and stores them correctly.

**Result:**  
Passed.

---

### 12. Community forum post retrieval

**Purpose:**  
Users need to be able to view forum posts that have been created.

**What was tested:**  
After creating a post, the forum posts list was fetched.

**What this confirms:**  
The backend can return existing forum posts for display in the app.

**Result:**  
Passed.

---

### 13. Comment creation

**Purpose:**  
Users need to be able to respond to forum posts.

**What was tested:**  
A signed-in user added a comment to a forum post.

**What this confirms:**  
The backend supports discussions through comments on posts.

**Result:**  
Passed.

---

### 14. Comment retrieval

**Purpose:**  
Users need to be able to read comments attached to a forum post.

**What was tested:**  
Comments for a created post were retrieved after the comment was added.

**What this confirms:**  
The backend can return comment threads correctly.

**Result:**  
Passed.

---

### 15. Liking a forum post

**Purpose:**  
Users should be able to like a post to show support or agreement.

**What was tested:**  
A signed-in user liked a forum post.

**What this confirms:**  
The backend supports likes and stores them correctly.

**Result:**  
Passed.

---

### 16. Preventing duplicate likes

**Purpose:**  
A user should not be able to like the same post multiple times.

**What was tested:**  
The same user attempted to like the same post a second time.

**What this confirms:**  
The backend correctly prevents duplicate likes and enforces expected behavior.

**Result:**  
Passed.

---

### 17. Push notification token storage

**Purpose:**  
To support push notifications, the backend needs to store a device token for each user.

**What was tested:**  
A signed-in user stored a push notification token.

**What this confirms:**  
The backend is able to save push notification registration data needed for future reminders or alerts.

**Result:**  
Passed.

---

### 18. Deleting your own forum post

**Purpose:**  
Users should be able to remove their own posts.

**What was tested:**  
The user who created a forum post deleted it afterward.

**What this confirms:**  
The backend allows users to remove their own content.

**Result:**  
Passed.

---

## Privacy and security checks

A major part of backend testing was confirming that users can only access or change data they are supposed to have access to.

### 19. Preventing one user from editing another user’s profile

**Purpose:**  
Private profile information should only be editable by the owner of that profile.

**What was tested:**  
One test user attempted to update the other test user’s profile.

**What this confirms:**  
The backend blocks unauthorized profile edits.

**Result:**  
Passed.

---

### 20. Preventing one user from logging mood data for another user

**Purpose:**  
Private wellness tracking data must only be created by the correct user.

**What was tested:**  
One test user attempted to submit a mood entry on behalf of the other test user.

**What this confirms:**  
The backend prevents one user from writing private mood data into another user’s account.

**Result:**  
Passed.

---

### 21. Preventing one user from viewing another user’s private profile data

**Purpose:**  
Users should only be able to see their own profile information.

**What was tested:**  
A profile fetch was performed while signed in as one user, and only that user’s profile was returned.

**What this confirms:**  
The backend restricts access to private profile records properly.

**Result:**  
Passed.

---

## Summary of currently confirmed working backend areas

At the time of this report, the following backend areas are confirmed working:

- user sign-up
- user login
- automatic profile creation
- reading profile data
- updating profile data
- viewing wellness interventions
- logging moods
- viewing mood history
- logging completed interventions
- viewing activity history
- viewing resources
- creating forum posts
- reading forum posts
- creating comments
- reading comments
- liking posts
- preventing duplicate likes
- storing push notification tokens
- deleting your own posts
- blocking unauthorized profile edits
- blocking unauthorized mood inserts
- protecting private profile visibility

---

## Out of scope / removed from coverage

The forum reporting feature was removed from project scope during testing. The related table was deleted and is no longer part of the active backend. Because of this, reporting is not included in the final backend coverage results.

---

## Conclusion

The current WellnessMD backend successfully supports the app’s main user flows and core data protection rules.

From a product perspective, the backend is already handling the most important responsibilities:

- managing user accounts
- storing user-specific wellness data
- serving shared app content
- supporting forum interaction
- protecting private data from unauthorized access

This gives the project a solid backend foundation for the next stage of development.

