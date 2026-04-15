-- Campus Lost & Found Management System
-- Seed Data

USE campus_lost_found;

-- Admin User (password: admin123)
INSERT INTO users (name, email, student_id, password, role) VALUES
('Admin', 'admin@campus.com', 'ADMIN001', '$2a$10$pxDjhK4Jkja9brEGmPE.VunTTiABER2r/84QD8mhYKODj3umuLKLS', 'admin');

-- Sample Users (password: password123 for all)
INSERT INTO users (name, email, student_id, password, role) VALUES
('Rahul Sharma', 'rahul@student.com', 'STU001', '$2a$10$P2SK0fHy1kd6DcU5B1hr4OuHXTtwL557cycLQ9srhi/xRRRY6l3iu', 'user'),
('Priya Patel', 'priya@student.com', 'STU002', '$2a$10$P2SK0fHy1kd6DcU5B1hr4OuHXTtwL557cycLQ9srhi/xRRRY6l3iu', 'user'),
('Amit Kumar', 'amit@student.com', 'STU003', '$2a$10$P2SK0fHy1kd6DcU5B1hr4OuHXTtwL557cycLQ9srhi/xRRRY6l3iu', 'user');

-- Categories
INSERT INTO categories (name, icon) VALUES
('Electronics', 'bi-phone'),
('Books', 'bi-book'),
('Clothing', 'bi-backpack'),
('Accessories', 'bi-watch'),
('ID Cards', 'bi-person-badge'),
('Keys', 'bi-key'),
('Bags', 'bi-bag'),
('Others', 'bi-three-dots');

-- Sample Items
INSERT INTO items (item_name, category_id, description, location, date, status, contact_info, user_id) VALUES
('iPhone 14 Pro', 1, 'Black iPhone 14 Pro with a blue case. Lost near the library entrance.', 'Main Library', '2026-03-05', 'Lost', 'rahul@student.com', 2),
('Data Structures Textbook', 2, 'CLRS Introduction to Algorithms textbook, 3rd edition. Has my name written on the first page.', 'Computer Science Building - Room 204', '2026-03-04', 'Lost', 'priya@student.com', 3),
('Blue Denim Jacket', 3, 'Navy blue denim jacket, medium size. Left in the cafeteria.', 'Main Cafeteria', '2026-03-03', 'Found', 'amit@student.com', 4),
('Silver Watch', 4, 'Fossil silver analog watch with leather strap. Found near the sports complex.', 'Sports Complex', '2026-03-06', 'Found', 'rahul@student.com', 2),
('Student ID Card', 5, 'University student ID card belonging to someone named Sneha. Found in parking lot.', 'Parking Lot B', '2026-03-07', 'Found', 'priya@student.com', 3),
('Car Keys with Keychain', 6, 'Honda car keys with a red keychain. Lost somewhere between Block A and the canteen.', 'Block A - Canteen Area', '2026-03-02', 'Lost', 'amit@student.com', 4),
('Black Laptop Bag', 7, 'HP black laptop bag containing some notebooks. Lost in the auditorium.', 'Auditorium', '2026-03-01', 'Lost', 'rahul@student.com', 2),
('Wireless Earbuds', 1, 'Samsung Galaxy Buds in white case. Found in classroom 301.', 'Academic Block - Room 301', '2026-03-08', 'Found', 'priya@student.com', 3),
('Umbrella', 8, 'Large black automatic umbrella. Found near the entrance gate after rain.', 'Main Gate', '2026-03-06', 'Found', 'amit@student.com', 4),
('Calculator', 1, 'Casio scientific calculator FX-991EX. Lost during exam in Hall 2.', 'Examination Hall 2', '2026-03-05', 'Claimed', 'rahul@student.com', 2);

-- Sample Claims
INSERT INTO claims (item_id, user_id, message, status) VALUES
(3, 2, 'This is my jacket. I can describe it in more detail if needed.', 'Pending'),
(10, 3, 'This is my calculator. It has my initials scratched on the back.', 'Approved');

-- Sample Notifications
INSERT INTO notifications (user_id, message) VALUES
(2, 'Your lost item "iPhone 14 Pro" has been posted successfully.'),
(3, 'Someone has claimed the item "Blue Denim Jacket" that you found.'),
(2, 'Your claim for "Calculator" has been approved!');
