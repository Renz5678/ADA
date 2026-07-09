# ADA - Client Portal Context

## Overview
This branch (`feature/client-portal`) introduces a new client-facing extension of ADA. It transitions ADA from a purely freelancer-managed tool into a centralized commerce hub where clients can browse available freelancers (businesses) and request orders directly.

## Core Workflows
1. **Business Discovery**: Clients can browse a directory of businesses (freelancers) operating on the ADA platform.
2. **Order Handshake**: 
   - **Client Initiates**: A client requests an order from a specific freelancer. Status is set to `Awaiting Freelancer Confirmation`.
   - **Freelancer Responds**: The freelancer reviews the order and chooses to Confirm or Decline it. Upon confirmation, the status moves to `Pending` and work begins.

## Data Models
- **Users**: Represents freelancers (businesses).
- **Clients**: Represents clients (buyers). Clients are independent entities but interact with Users.
- **Orders**: Extended to include a `client_id` and expanded statuses to handle the new handshake flow.

## Codebase Organization
To ensure the project scales maintainably:
- **Frontend (`client/src`)**: Feature pages are separated into `pages/app` (freelancer side) and `pages/client` (client side). Common UI components are shared in `components/ui`.
- **Backend (`server/src`)**: Dedicated routes (`clientAuth`, `clientOrders`, `clientBusinesses`) separate client logic from freelancer logic.

## Future Roadmap
- **Smart Suggestions**: An AI-driven or rules-based engine that recommends freelancers to clients based on past behaviors and orders.
