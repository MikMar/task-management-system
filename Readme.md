# 📝 Task Management System (TMS)

## 📌 Project Overview
This **Task Management System (TMS)** is a **microservices-based** project developed for **learning purposes**. It demonstrates how to build a scalable backend system using **Node.js, Express, NestJS, gRPC, Kafka, and Docker**.

The system provides:
- **User Authentication**
- **Task Management (Create, Assign, Update Tasks)**
- **Email Notifications on Task Assignment**
- **Resilience Features** (Retries, Circuit Breakers, Message Queues)

## 🏗 **Microservices Architecture**
This project follows a **microservices** architecture, where each service is independent and communicates via **gRPC**.

### **🛠 Services**
| **Service**        | **Description** |
|--------------------|----------------|
| **API Gateway**    | The main entry point for clients. Handles requests, authentication, and forwards to microservices. |
| **Auth Service**   | Manages user authentication, JWT token handling, and user verification. |
| **Task Service**   | Handles task creation, assignment, and updates. Uses PostgreSQL for storage. |
| **Notification Service** | Sends emails when tasks are assigned. Listens to Kafka messages. |
| **Kafka**         | Message broker for **event-driven communication** between services. |
| **MongoDB (Auth DB)** | Stores user authentication data. |
| **PostgreSQL (Task DB)** | Stores task-related data. |

---

## ⚡ **gRPC Communication**
Microservices communicate using **gRPC** instead of REST for **efficient, binary communication**.

### **Example gRPC Calls**
#### **Auth Service - Verify Token**
- **Request**: `{ token: "JWT_TOKEN_HERE" }`
- **Response**: `{ userId: "abc123", valid: true }`

#### **Task Service - Create Task**
- **Request**: `{ title: "New Task", assignedTo: "user123" }`
- **Response**: `{ id: 1, title: "New Task", assignedTo: "user123", status: "open" }`

#### **Notification Service - Kafka Event Handling**
- Listens for `task_created` events and **sends an email**.

---

## 🏗 **Project Setup & Running the Services**
This project is fully **containerized** using **Docker & Docker Compose**.

### Prerequisites
Before running the project, make sure you have:
- **Docker** installed: [Download Docker](https://www.docker.com/)
- **Node.js** (if running locally without Docker)

### Clone the Repository**
```bash
git clone https://github.com/MikMar/task-management-system
cd task-management-system
```
Run `docker-compose up -d --build` to up all containers.
All services will start automatically.
