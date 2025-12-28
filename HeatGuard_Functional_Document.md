
# HeatGuard: AI-Based Heatwave Health Risk Prediction
## Functional Document

## 1. Introduction
The **HeatGuard: AI-Based Heatwave Health Risk Prediction** project aims to build a decision-support system that predicts heat-related health risks **5–7 days in advance** and helps authorities protect vulnerable populations from extreme heat.

## 2. Product Goal
The primary goal is to provide **district-level, health-focused heat risk forecasts** that combine weather data, demographic vulnerability, and health indicators, presented through an intuitive **dashboard and API** for government, healthcare, and disaster-management stakeholders.

## 3. Demography (Users, Location)

### Users
- **Target Users:**
  - State and municipal health departments  
  - Disaster management authorities  
  - Hospitals / PHCs  
  - Urban local bodies  
  - NGOs working on climate & health  
  - Public health researchers  

- **User Characteristics:**
  - Mixed technical proficiency  
  - Primarily non-ML experts  
  - Prefer intuitive dashboards and clear alerts  
  - Highly time-constrained during heat season  
  - Need concise, action-oriented insights rather than raw data  

### Location
- **Initial Focus:** Heat-prone districts in **Tamil Nadu** (e.g., Chennai region)
- **Scalability:** Designed to scale to other Indian states and South Asian cities, subject to availability of weather, demographic, and health data

## 4. Business Processes

### 4.1 Data Ingestion & Processing
- Collect **5–7 day weather forecasts** (temperature, humidity, heat index) from IMD / APIs
- Integrate **historical health data** (heat-related admissions/mortality or proxy indicators)
- Merge **demographic and vulnerability data** (age distribution, poverty, housing type, outdoor workers) at district level
- Optionally include **Urban Heat Island (UHI)** or land-surface temperature layers

### 4.2 Risk Prediction Workflow
- Run ML models **daily** to predict heat-health risk scores for each district and vulnerable group:
  - Elderly
  - Children
  - Outdoor workers
- Classify risk into levels:
  - Green
  - Yellow
  - Orange
  - Red

### 4.3 Alerting & Visualization
- Expose predictions via **REST APIs**
- Display:
  - Risk maps
  - District tables
  - Trend charts
- Enable export of **CSV / PDF reports** for daily situation briefs and Heat Action Plan (HAP) triggers

## 5. Features

### 5.1 Feature #1: Heat-Health Risk Prediction Engine
**Description:**  
A machine-learning engine that predicts district-level heat-related health risk **5–7 days ahead** using weather, demographic, and historical health data. Outputs graded risk levels and key contributing factors.

**User Story:**
- As a **district health officer**
- I want to see predicted heat-health risk levels for my district for the next 5–7 days
- So that I can plan hospital readiness, outreach, and preventive measures before a heatwave hits

### 5.2 Feature #2: Vulnerability-Aware Risk Stratification
**Description:**  
Adjusts risk scores based on population vulnerability (age, socio-economic status, housing, occupation) and provides separate risk indices for:
- Elderly
- Children
- Outdoor workers

**User Story:**
- As a **city planner or NGO partner**
- I want to know which wards have the highest risk for elderly and outdoor workers
- So that I can target cooling centers, outreach, and awareness campaigns effectively

### 5.3 Feature #3: Heat Action Plan Support Dashboard
**Description:**  
A web-based dashboard visualizing forecasted risk, vulnerable populations, and recommended actions aligned with **National/State Heat Action Plans (HAPs)**.

**User Story:**
- As a **state disaster management official**
- I want a dashboard showing top high-risk districts for the next week with recommended HAP actions
- So that I can quickly decide when to issue alerts, open cooling centers, and coordinate agencies

## 6. Authorization Matrix

| Role | Description | Access Rights |
|-----|------------|--------------|
| **System Admin** | Technical owner (IT team) | Full access: user & role management, data sources, model training/deployment, thresholds, dashboards & APIs |
| **State / Municipal Health Officer** | Government health authority | View risk maps/tables, vulnerability overlays, download reports, configure local notifications |
| **Disaster Management Official** | City / disaster operations | View forecasts & recommended actions, download reports |
| **Hospital / PHC Representative** | Hospitals & PHCs | Read-only access to district risk levels, trends, and clinical preparedness guidance |
| **Researcher / Policy Analyst** | Accredited researchers | Access anonymized & aggregated historical predictions and evaluation metrics |
| **Citizen / Public User (Future)** | General public | Access public heat alerts and generic advisories only |

## 7. Assumptions
- Sufficient historical weather and proxy health data are available for model training
- Census and vulnerability datasets are accessible for pilot regions
- Stakeholders are willing to share aggregated data and validate requirements
- System operates as a **daily batch prediction service** during heat season
- All data handling complies with privacy and security regulations, exposing only aggregated/anonymized data
