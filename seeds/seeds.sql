INSERT INTO department(name)
VALUES (Engineering),
(Administration),
(Legal),
(Marketing);

INSERT INTO role (title, salary, department_id)
VALUES (Chief Information Officer, 170000, 1),
(Lead Engineer, 120000, 1),
(Junior Developer, 80000, 1),
(Quality Assurance Tester, 60000, 1),
(HR Director, 90000, 2),
(HR Specialist, 70000, 2),
(Recruiter, 60000, 2),
(Lead Counsel, 100000, 3),
(Legal Aide, 50000, 3),
(Chief Marketing Officer, 90000, 4),
(Marketing Specialist, 70000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES (Scott, Javascript, 1, NULL),
(John, Java, 2, 1),
(Anita, Node, 3, 2),
(Robert, CSharp, 4, 2),
(Chris, Python, 5, NULL),
(Julie, Ruby, 6, 5),
(Sara, Kotlin, 7, 5),
(Shreesh, Go, 8, NULL),
(Rachel, Scala, 9, 8),
(Luyao, Cobol, 10, NULL),
(Cory, Typescript, 11, 10);