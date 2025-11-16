# Coach's Clipboard - Entity Relationships & Data Model

## User Roles

All roles currently have the same access to all features. Future enhancements can implement role-based permissions.

### Defined Roles:

1. **Coach** - Individual coach managing sessions and players
2. **Head Coach** - Lead coach with administrative oversight
3. **Admin** - System administrator with full control

**Current Implementation:** All users have equal access to all features.

---

## Core Entities & Relationships

### 1. **Team** 👥

- **Purpose:** Group of players managed by coach(es)
- **Key Fields:**
  - `id`: Unique identifier
  - `name`: Team name
  - `ageGroup`: Age category (e.g., U-10, U-15, etc.)
  - `coach`: Coach name/ID managing the team
- **Relationships:**
  - ➡️ **Has many** Players (1:N)
  - ➡️ **Has many** Sessions (1:N)

---

### 2. **Player** ⚽

- **Purpose:** Individual athlete in a team
- **Key Fields:**
  - `id`: Unique identifier
  - `name`: Player name
  - `teamId` (FK): Foreign key to Team
  - `dob`: Date of birth
  - `notes`: Additional player notes
- **Relationships:**
  - ➡️ **Belongs to** Team (N:1)
  - ➡️ **Has many** BehaviorEntries (1:N)
  - ➡️ **Has many** Attendance records (1:N)

---

### 3. **Session** 📅

- **Purpose:** Training session or match for a team
- **Key Fields:**
  - `id`: Unique identifier
  - `teamId` (FK): Foreign key to Team
  - `dateTime`: Session date and time
  - `type`: SessionType (Training, Match, Event)
  - `focus`: Session focus area
  - `trainingPlanId` (FK): Reference to Training Plan (optional)
  - `notes`: Additional session notes
- **Relationships:**
  - ➡️ **Belongs to** Team (N:1)
  - ➡️ **References** TrainingPlan (N:1, optional)
  - ➡️ **Has many** BehaviorEntries (1:N)
  - ➡️ **Has many** Attendance records (1:N)

---

### 4. **Behavior Record (BehaviorEntry)** 📊

- **Purpose:** Track player behavior during a specific session
- **Key Fields:**
  - `sessionId` (FK): Foreign key to Session
  - `playerId` (FK): Foreign key to Player
  - `status`: BehaviorStatus (None, Green, Yellow, Red)
  - `tags`: Array of BehaviorTag (Listening, Respect, Effort, Aggression, Distraction)
  - `note`: Additional notes about behavior
- **Primary Key:** Composite (sessionId, playerId)
- **Relationships:**
  - ➡️ **Belongs to** Session (N:1)
  - ➡️ **Belongs to** Player (N:1)

---

### 5. **Drill** 🎯

- **Purpose:** Reusable training exercise/drill
- **Key Fields:**
  - `id`: Unique identifier
  - `name`: Drill name
  - `ageGroups`: Array of applicable age groups
  - `category`: DrillCategory (Technical, Physical, Social/Values)
  - `description`: Detailed drill description
  - `duration`: Duration in minutes
  - `equipment`: Required equipment list
  - `tags`: Categorization tags
  - `videoUrl`: Optional video demonstration URL
  - `setup`: Setup instructions
  - `instructions`: Execution instructions
- **Relationships:**
  - ➡️ **Has many** PlanDrill entries (1:N)
  - ➡️ **Used in** TrainingPlans (indirect, via PlanDrill)

---

### 6. **Training Plan** 📋

- **Purpose:** Structured plan containing multiple drills for a session
- **Key Fields:**
  - `id`: Unique identifier
  - `name`: Plan name
  - `theme`: Plan theme or focus area
  - `drills`: Array of PlanDrill entries
- **Relationships:**
  - ➡️ **Has many** PlanDrill entries (1:N)
  - ➡️ **Referenced by** Sessions (N:1)
  - ➡️ **Contains** Drills (indirect, via PlanDrill)

---

### 7. **PlanDrill** (Junction/Association Entity)

- **Purpose:** Associates a Drill with a TrainingPlan
- **Key Fields:**
  - `drillId` (FK): Foreign key to Drill
  - `duration`: Duration override for this specific plan
- **Relationships:**
  - ➡️ **References** Drill (N:1)
  - ➡️ **Belongs to** TrainingPlan (N:1)

---

### 8. **Attendance** ✅

- **Purpose:** Track player attendance in sessions
- **Key Fields:**
  - `sessionId` (FK): Foreign key to Session
  - `playerId` (FK): Foreign key to Player
  - `present`: Boolean indicating attendance
- **Primary Key:** Composite (sessionId, playerId)
- **Relationships:**
  - ➡️ **Belongs to** Session (N:1)
  - ➡️ **Belongs to** Player (N:1)

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    Team     │
├─────────────┤
│ id (PK)     │
│ name        │
│ ageGroup    │
│ coach       │
└──────┬──────┘
       │ 1:N
       ├─────────────────────────────────────┐
       │                                     │
   ┌───▼────────────┐              ┌────────▼──────┐
   │     Player     │              │    Session    │
   ├────────────────┤              ├───────────────┤
   │ id (PK)        │              │ id (PK)       │
   │ teamId (FK)    │◄─1:N─────┐  │ teamId (FK)   │
   │ name           │         1│N │ dateTime      │
   │ dob            │          │  │ type          │
   │ notes          │          │  │ focus         │
   └────┬───────────┘          │  │ trainingPlanId│ ─FK──┐
        │                      │  └────┬──────────┘     │
        │                      │       │ 1:N           │
        │  1:N          1:N    │   ┌───┴──────────┐    │
        ├────────┬────────┬───┤   │  Attendance  │    │
        │        │        │   │   ├──────────────┤    │
        │        │        │   └───┤sessionId(FK) │    │
        │        │        └───────┤playerId (FK) │    │
        │        │                │ present      │    │
        │        │                └──────────────┘    │
        │        │                                    │
    ┌───▼────────▼────────┐                      ┌────▼─────────────┐
    │  BehaviorEntry      │                      │  TrainingPlan    │
    ├─────────────────────┤                      ├──────────────────┤
    │sessionId(FK,PK)     │                      │ id (PK)          │
    │playerId (FK,PK)     │                      │ name             │
    │ status              │                      │ theme            │
    │ tags                │                      │ drills (Array)   │
    │ note                │                      └──────┬───────────┘
    └─────────────────────┘                             │ 1:N
                                                        │
                                                   ┌────▼────────────┐
                                                   │   PlanDrill     │
                                                   ├─────────────────┤
                                                   │drillId(FK)      │
                                                   │duration         │
                                                   └────┬────────────┘
                                                        │ N:1
                                                        │
                                                   ┌────▼────────────┐
                                                   │     Drill       │
                                                   ├─────────────────┤
                                                   │ id (PK)         │
                                                   │ name            │
                                                   │ ageGroups       │
                                                   │ category        │
                                                   │ description     │
                                                   │ duration        │
                                                   │ equipment       │
                                                   │ tags            │
                                                   │ videoUrl        │
                                                   │ setup           │
                                                   │ instructions    │
                                                   └─────────────────┘
```

---

## Data Flow Example

1. **Create Team** → Add Players to Team
2. **Create Drills** → Organize into Training Plans
3. **Create Session** → Link to Team, assign Training Plan
4. **During Session** → Record Attendance & Behavior for each Player
5. **After Session** → Review behavior trends, attendance records, plan next sessions

---

## Notes for Future Enhancement

- User authentication/role-based access control
- Data persistence (backend database)
- Data export/reporting capabilities
- Historical behavior analytics
- Injury tracking and fitness progression monitoring
