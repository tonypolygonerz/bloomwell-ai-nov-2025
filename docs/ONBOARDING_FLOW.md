# Onboarding Flow - Reorganized Structure

## Overview

The onboarding flow has been reorganized into 4 logical steps that progressively build a complete profile for accurate grant matching. Users can skip onboarding but will be prompted to complete it when attempting to search for grants.

## Step 1: Who You Are (Identity & Type)

**Purpose:** Establish organization identity and eligibility type

**Fields:**

- Organization Type (required)
  - US Registered 501(c)(3) Nonprofit
  - Freelance Grant Writer / Grant Writing Agency
  - University / College / School / School District
  - Government Entity
  - Other (Individual Researcher, For-Profit, etc.)

- ProPublica Verification (optional, shown for eligible types)
  - EIN number search
  - Auto-populates: Legal name, EIN, IRS verification
  - Available for: 501(c)(3), Universities, Government Entities

**Why First:** Organization type determines grant eligibility categories. ProPublica verification ensures accurate identity matching.

## Step 2: What You Do (Mission & Focus)

**Purpose:** Understand organization's purpose and scope for grant matching

**Fields:**

- Mission Statement (required for completion)
  - Describe what the organization does and who it serves
  - Used for semantic matching with grant opportunities

- Focus Areas (comma-separated)
  - Example: "education, healthcare, environment, housing, arts"
  - Helps filter grants by relevant topics

- Geographic Service Area
  - Inside US | Outside US | Both
  - If "Both": specify counties, states, or countries
  - Critical for location-specific grants

**Why Second:** Mission and focus areas are the primary matching criteria for grants. This information is essential for finding relevant funding opportunities.

## Step 3: Your Capacity (Financial Profile & Experience)

**Purpose:** Assess organizational capacity to handle grants and identify appropriate grant sizes

**Fields:**

- Annual Operating Budget
  - Budget ranges: <$90K to $10M+
  - Helps determine grant size appropriateness

- Annual Revenue
  - Total revenue from all sources
  - Separate from budget (includes grants, donations, fees)

- Staff Size
  - Number of full-time equivalent employees
  - Indicates grant management capacity

- Recent Grant Activity (Last 12 Months)
  - 0 grants | 1-5 | 6-10 | 11-15 | 16-50 | 50+
  - Shows experience level with grant applications

- Fiscal Year
  - Select fiscal year period (January-December, etc.)
  - Important for grant deadline planning

**Why Third:** Capacity information helps match organizations with grants they can realistically pursue and manage. This prevents mismatched recommendations.

## Step 4: Review & Complete

**Purpose:** Confirm all information before unlocking full features

**Features:**

- Organized review by category:
  - Organization Identity
  - Mission & Focus
  - Capacity & Experience
- Editable summary
- Note: All fields can be edited later in Settings
- Completion unlocks full grant search capabilities

## Completion Logic

Onboarding is considered complete when:

- **Mission statement exists** (from Step 2 - critical for matching)
- **At least one capacity field exists** (budget, revenue, or staff size from Step 3)

This ensures users provide the minimum information needed for effective grant matching.

## Skip Functionality

- Users can skip onboarding at any step
- App access is not blocked for incomplete profiles
- A banner appears at the top encouraging completion
- **Grant Search Requirement:** When users attempt to search for grants, they will be prompted to complete onboarding first (via `GrantSearchPrompt` component)

## Implementation Notes

- All data persists after each step
- ProPublica integration auto-populates when EIN is found
- Geographic service area supports detailed location input for "Both" option
- Profile can be edited anytime in Settings after completion
- Completion status checked via `/api/onboarding/status`
- Banner component shows encouragement but doesn't block access
