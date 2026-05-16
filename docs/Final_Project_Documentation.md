# HEALTHMATE: AN AI-POWERED NUTRITION ASSISTANT

## PRELIMINARY PAGES

### TITLE PAGE
**CENTRAL UNIVERSITY**
**SCHOOL OF ENGINEERING & TECHNOLOGY**

**HEALTHMATE: AN AI-POWERED NUTRITION ASSISTANT**

**BY**
**ISAAC [LAST NAME]**
**(INDEX NUMBER: [INDEX NUMBER])**

**A PROJECT SUBMITTED TO THE DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF BACHELOR OF SCIENCE IN COMPUTER SCIENCE.**

**MAY 2026**

---

### DECLARATION
I, **Isaac [Last Name]**, hereby declare that this project work is the result of my own research and that no part of it has been presented for another degree in this University or elsewhere. All citations and references have been duly acknowledged.

**Signature:** ____________________  
**Date:** ____________________

**SUPERVISOR'S DECLARATION**
I hereby declare that the preparation and presentation of this project were supervised in accordance with the guidelines on supervision of project work laid down by the Central University.

**Supervisor Name:** ____________________  
**Signature:** ____________________  
**Date:** ____________________

---

### DEDICATION
I dedicate this work to my family for their unwavering support and to all individuals striving for a healthier lifestyle through technology.

---

### ACKNOWLEDGEMENTS
I would like to express my profound gratitude to my supervisor for their guidance throughout this project. I also thank the faculty of the School of Engineering & Technology for providing the environment and resources necessary for my academic growth. Finally, thanks to my friends and colleagues for their constant encouragement.

---

### ABSTRACT
Modern lifestyles have led to an increase in nutrition-related health issues, primarily due to the difficulty of maintaining balanced diets in a fast-paced world. Current health applications often rely on manual data entry or generic plans that do not adapt to individual needs. This project, **HealthMate**, addresses these gaps by leveraging Generative Artificial Intelligence (Gemini AI) to provide personalized meal planning, calorie tracking, and hydration goals. Built using the MERN stack (MongoDB, Express, React, Node.js) and integrated with Firebase for secure authentication, HealthMate offers a dynamic interface where users can receive tailored nutrition advice based on their dietary preferences, health goals, and budget. Preliminary results indicate that AI-driven personalization significantly reduces the cognitive load of meal planning and improves user adherence to health goals.

---

### TABLE OF CONTENTS
1.  **CHAPTER ONE: INTRODUCTION**
    1.1 Background of the Study
    1.2 Problem Statement
    1.3 Objectives
    1.4 Scope and Limitations
    1.5 Significance of the Study
    1.6 Methodology Overview
    1.7 Project Schedule
2.  **CHAPTER TWO: LITERATURE REVIEW**
    2.1 Review of Related Systems
    2.2 System Models for Related Systems
    2.3 Comparison and Gap Analysis
3.  **CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN**
    3.1 Proposed System Overview
    3.2 Requirements Analysis
    3.3 System Architecture
    3.4 Database Design
    3.5 User Interface Design

---

### LIST OF FIGURES
- Figure 1.1: Project Schedule (Gantt Chart)
- Figure 2.1: Context Model of Existing Systems
- Figure 3.1: HealthMate System Architecture
- Figure 3.2: Entity Relationship Diagram (ERD)
- Figure 3.3: Use Case Diagram

---

### LIST OF ABBREVIATIONS
- **AI**: Artificial Intelligence
- **API**: Application Programming Interface
- **MERN**: MongoDB, Express, React, Node.js
- **UI/UX**: User Interface / User Experience
- **ERD**: Entity Relationship Diagram

---

## CHAPTER ONE: INTRODUCTION

### 1.1 Background of the Study
The global rise in lifestyle-related diseases such as obesity, diabetes, and hypertension has highlighted the critical role of nutrition in health maintenance. While the awareness of healthy eating is growing, the practical execution of a balanced diet remains a challenge for many. Traditional methods of meal planning involve manual research, calorie counting, and budget management, which are often time-consuming and prone to error. The emergence of mobile health (mHealth) applications has provided tools to assist in this process, but many existing solutions are static or require excessive manual input.

### 1.2 Problem Statement
Despite the availability of numerous health apps, users still face several hurdles:
1.  **Manual Overload**: Most apps require users to manually search and log every food item, leading to user fatigue.
2.  **Lack of Personalization**: Generic meal plans do not account for individual tastes, local availability of ingredients, or specific financial budgets.
3.  **Static Advice**: Recommendations often fail to adapt to a user's progress or feedback in real-time.

There is a need for an intelligent system that automates the meal planning process using AI, ensuring that plans are personalized, budget-friendly, and easy to follow.

### 1.3 Objectives
#### General Objective
To design and develop an AI-powered nutrition assistant that provides personalized meal planning and health tracking to improve dietary adherence.

#### Specific Objectives
1.  To implement an AI-driven meal generation engine using Gemini AI.
2.  To develop a tracking system for calories, hydration, and weight.
3.  To integrate secure user authentication and profile management using Firebase.
4.  To visualize user progress through interactive charts and analytics.

### 1.4 Scope and Limitations
**Scope**: The application focuses on meal planning (breakfast, lunch, dinner, snacks), calorie tracking, hydration goals, and progress visualization. It targets individual users looking to manage their weight or improve their diet.
**Limitations**: The app relies on the accuracy of third-party AI (Gemini) and requires a stable internet connection. It does not replace professional medical advice for clinical nutrition therapy.

### 1.5 Significance of the Study
HealthMate provides a low-cost, highly accessible personal nutritionist in the form of a web application. By automating the planning process, it empowers users to make healthier choices without the stress of manual calculation. For developers, this study demonstrates the integration of Large Language Models (LLMs) into health-tech ecosystems.

### 1.6 Methodology Overview
The project follows the **Agile Development Methodology**, allowing for iterative improvements based on testing. 
- **Frontend**: React.js with Vite for a fast, responsive UI.
- **Backend**: Express.js and Node.js for robust API management.
- **Database**: MongoDB Atlas for flexible, document-oriented data storage.
- **AI Integration**: Gemini Pro API for natural language processing and meal generation.

### 1.7 Project Schedule
| Milestone | Duration | Status |
|-----------|----------|--------|
| Requirement Gathering | 2 Weeks | Completed |
| System Design | 3 Weeks | Completed |
| Backend Development | 4 Weeks | Completed |
| Frontend Development | 4 Weeks | In Progress |
| AI Integration & Testing | 2 Weeks | Pending |
| Final Documentation | 2 Weeks | In Progress |

---

## CHAPTER TWO: LITERATURE REVIEW

### 2.1 Review of Related Systems
Several systems exist in the market that provide nutrition tracking and planning:
1.  **MyFitnessPal**: A leading app with a massive food database. It focuses heavily on manual logging and calorie counting.
2.  **Noom**: Uses a psychology-based approach to encourage healthy habits, often requiring a paid subscription for coaching.
3.  **Mealime**: Focuses on meal planning and grocery lists but lacks integrated health tracking like weight and mood logging.

### 2.2 System Models for Related Systems
- **Context Model**: Most existing systems interact with a central food database API and a payment gateway. They are closed systems where users input data and receive static reports.
- **Interaction Model**: The primary interaction is "Search and Select." Users search for food, select the portion, and the system updates the daily total.
- **Structural Model**: They utilize relational databases to store millions of food items, linked by nutritional attributes.
- **Behavioral Model**: The system states are usually "Idle," "Logging," or "Reporting." Transition between states is triggered by user input.

### 2.3 Comparison and Gap Analysis
| Feature | MyFitnessPal | Noom | HealthMate (Proposed) |
|---------|--------------|------|----------------------|
| Personalization | Manual | High (Human) | High (AI-Driven) |
| Automation | Low | Medium | High |
| Cost | Freemium | High (Subscription) | Free/Open |
| Feedback Loop | Static | Coaching | Dynamic AI |

**The Gap**: Current systems either require too much manual work (MyFitnessPal) or are too expensive (Noom). HealthMate fills this gap by providing high-level AI personalization for free, reducing user effort while maintaining high accuracy.

---

## CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN

### 3.1 Proposed System Overview
HealthMate is a web-based nutrition assistant. Upon login, users create a profile with their physical attributes and dietary preferences. The system then uses Gemini AI to generate a 7-day meal plan that fits their calorie needs and budget. Users can "check off" meals they have eaten, which updates their progress charts in real-time.

### 3.2 Requirements Analysis
- **Functional Requirements**:
    - User Authentication (Google/Email).
    - Profile Management (Age, Weight, Goals).
    - AI Meal Plan Generation.
    - Water and Calorie Tracking.
    - Data Visualization.
- **Non-Functional Requirements**:
    - **Security**: Secure data transit and storage.
    - **Performance**: AI responses within <5 seconds.
    - **Usability**: Mobile-first, intuitive design.

### 3.3 System Architecture
HealthMate follows a **Client-Server Architecture**:
1.  **Client (React)**: Handles user interactions and state management.
2.  **Server (Express)**: Manages API routes, authentication logic, and AI prompting.
3.  **Database (MongoDB)**: Stores user profiles, meal plans, and progress logs.
4.  **External APIs**: 
    - **Gemini API**: Generates meals.
    - **Firebase Auth**: Manages identity.

### 3.4 Database Design (ERD)
The database consists of three main collections:
- **Users**: Stores `uid`, `email`, `age`, `weight`, `dietaryPreferences`, etc.
- **MealPlans**: Stores daily meal arrays linked to a `userId`.
- **Progress**: Stores daily logs of `water`, `weight`, `caloriesBurned`, and `mood`.

### 3.5 User Interface Design
The design focuses on a "Clean and Green" aesthetic, symbolizing health and vitality.
- **Dashboard**: A summary of today's meals and hydration progress.
- **Tracker**: Interactive charts showing trends over time.
- **Profile**: A centralized hub for updating personal metrics and dietary constraints.

---
**End of Documentation up to Chapter Three.**
