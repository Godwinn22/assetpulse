# Assetpulse

Assetpulse is an internal asset management system built with React, Vite, and Supabase.  
It allows administrators to manage organizational devices while enabling staff to securely view assets assigned to them.

---

## 🚀 Overview

Assetpulse provides:

- Secure user authentication
- Role-based access control (Admin / Staff)
- Device tracking
- Assignment history tracking
- Row-Level Security (RLS) enforced at the database level
- Clean, scalable architecture

---

## 🏗 Tech Stack

Frontend:
- React
- Vite

Backend:
- Supabase (Auth + PostgreSQL + RLS)

---

## 🔐 Access Control Model

### Admin
- View all devices
- Create, update, delete devices
- Assign and return devices
- View all assignment history
- View all users

### Staff
- View devices currently assigned to them
- View their own assignment history
- View their profile