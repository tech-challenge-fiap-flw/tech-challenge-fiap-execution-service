-- Execution Service Database Schema

CREATE TABLE IF NOT EXISTS executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  serviceOrderId INT NOT NULL,
  mechanicId INT NOT NULL,
  status ENUM('waiting', 'in_progress', 'finished', 'delivered') NOT NULL DEFAULT 'waiting',
  notes TEXT,
  startedAt DATETIME,
  finishedAt DATETIME,
  deliveredAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_service_order (serviceOrderId)
);

CREATE TABLE IF NOT EXISTS execution_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  executionId INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  status ENUM('pending', 'in_progress', 'done') NOT NULL DEFAULT 'pending',
  assignedMechanicId INT,
  startedAt DATETIME,
  completedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (executionId) REFERENCES executions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  eventId VARCHAR(255) PRIMARY KEY,
  processedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
