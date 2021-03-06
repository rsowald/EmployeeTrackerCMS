const inquirer = require('inquirer');
const cTable = require('console.table');
const getConnection = require('./db/connection');
let connection;

//main menu
const displayMenu = async () => {
    const answer = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            { name: 'View all employees', value: viewEmployees },
            { name: 'View all roles', value: viewRoles },
            { name: 'View all departments', value: viewDepartments },
            { name: 'Add employee', value: insertEmployee },
            { name: 'Add role', value: insertRole },
            { name: 'Add department', value: insertDepartment },
            { name: 'Update employee role', value: updateEmployeeRole },
            { name: 'Update employee manager', value: updateEmployeeManager },
            { name: 'View employees by manager', value: viewEmployeesByManager },
            { name: 'Remove employee', value: deleteEmployee },
            { name: 'Display department budgets', value: displayBudgets },
            { name: 'Exit', value: 'exit' },
        ]
    });
    //the only case that will end program
    if (answer.action === 'exit') {
        await endProgram();
    }
    //will re-prompt main menu after the selected function runs 
    else {
        const fn = answer.action;
        await fn();
        await displayMenu();
    }

};
// query employees separately so it's available to use in multiple methods
const queryEmployees = async () => {
    //connection.execute does not require a callback function, but does require that the output is stored in an array
    const [rows] = await connection.execute(
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, " ", m.last_name)  manager
        FROM employee e
        LEFT JOIN employee m ON e.manager_id = m.id
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        ORDER BY e.id`);

    return rows;
};

const viewEmployees = async () => {
    const rows = await queryEmployees();
    console.table(rows);
};

const viewEmployeesByManager = async () => {
    const [rows] = await connection.execute(
        //selecting distinct so that managers with multiple employees under them don't appear twice
        `SELECT DISTINCT m.id, m.first_name, m.last_name
                FROM employee m
                JOIN employee e ON m.id = e.manager_id
                ORDER BY m.first_name;`
    )
    const answer = await inquirer.prompt([
        {
            name: 'manager_id',
            type: 'list',
            message: "Which manager's employees would you like to view?",
            choices: rows.map(r => ({ name: r.first_name + " " + r.last_name, value: r.id }))
        },
    ]);
    const [employees] = await connection.execute(
        'SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, " ", m.last_name)  manager FROM employee e   LEFT JOIN employee m ON e.manager_id = m.id JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id WHERE e.manager_id = ? ORDER BY e.id', [answer.manager_id]
    );
    console.table(employees);
};

const queryRoles = async () => {
    const [rows] = await connection.execute(
        `SELECT r.id, r.title, r.salary, d.name department
        FROM role r
        JOIN department d ON r.department_id = d.id
        ORDER BY r.id`);

    return rows;
}

const viewRoles = async () => {
    const rows = await queryRoles();
    console.table(rows);
};

const queryDepartments = async () => {
    const [rows] = await connection.execute(
        `SELECT * FROM department
        ORDER BY id`);

    return rows;
}

const viewDepartments = async () => {
    const rows = await queryDepartments();

    console.table(rows);
};

const insertEmployee = async () => {
    //role is a required field in employee table, so there must be a role available first
    const roles = await queryRoles();
    if (roles.length === 0) {
        console.log('You must first create a role.');
        return;
    }
    const employees = await queryEmployees();
    // prompt for info about the employee
    const answer = await inquirer.prompt([
        {
            name: 'first_name',
            type: 'input',
            message: "What is the employee's first name?",
        },
        {
            name: 'last_name',
            type: 'input',
            message: "What is the employee's last name?",
        },
        {
            name: 'role_id',
            type: 'list',
            message: "What is their job title?",
            choices: roles.map(r => ({ name: r.title, value: r.id })),
        },
        {
            name: 'manager_id',
            type: 'list',
            message: "What is their manager's name?",
            choices: [{ name: "none", value: null }].concat(employees.map(r => ({ name: r.first_name + " " + r.last_name, value: r.id })))
        }
    ]);

    // when finished prompting, insert a employee into the db with that info
    // when nothing needs to be returned, I can use connection.query without a callback
    await connection.query(
        'INSERT INTO employee SET ?',
        {
            ...answer
        });
    console.log('Your employee was added successfully!');
};

const insertRole = async () => {
    //department is a required field in role table, so there must be a department available first
    const rows = await queryDepartments();
    if (rows.length === 0) {
        console.log('You must first create a department.');
        return;
    }
    // prompt for info about the role
    const answer = await inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: "What is the job title?",
        },
        {
            name: 'salary',
            type: 'input',
            message: "What is the salary for this role?",
            validate(value) {
                return isNaN(value) === false;
            },
        },
        {
            name: 'department_id',
            type: 'list',
            message: "To which department does this role belong?",
            choices: rows.map(r => ({ name: r.name, value: r.id }))
        },
    ]);

    // when finished prompting, insert a role into the db with that info
    await connection.query(
        'INSERT INTO role SET ?',
        {
            ...answer
        });
    console.log('The role was added successfully!');
};

const insertDepartment = async () => {
    // prompt for info about the department
    const answer = await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: "What is the name of the department?",
        },
    ]);

    // when finished prompting, insert a department into the db with that info
    await connection.query(
        'INSERT INTO department SET ?',
        {
            ...answer
        });
    console.log('The department was added successfully!');

};

const updateEmployeeRole = async () => {
    const employees = await queryEmployees();
    const roles = await queryRoles();
    const answer = await inquirer.prompt([
        {
            name: 'employee_id',
            type: 'list',
            message: "Which employee would you like to update?",
            choices: employees.map(r => ({ name: r.first_name + " " + r.last_name, value: r.id }))
        },
        {
            name: 'role_id',
            type: 'list',
            message: "What is the employee's new role?",
            choices: roles.map(r => ({ name: r.title, value: r.id }))
        }
    ]);
    await connection.query(
        'UPDATE employee SET role_id = ? WHERE id= ?',
        [answer.role_id, answer.employee_id]
    );
    console.log('The employee role was successfully updated!')
};

const updateEmployeeManager = async () => {
    const employees = await queryEmployees();
    const answer = await inquirer.prompt([
        {
            name: 'employee_id',
            type: 'list',
            message: "Which employee would you like to update?",
            choices: employees.map(r => ({ name: r.first_name + " " + r.last_name, value: r.id }))
        }
    ]);
    //when giving manager choices, I excluded the employee themselves and included a none/null option
    const allExceptSelectedEmp = employees
        .filter(r => answer.employee_id !== r.id)
        .map(r => ({ name: r.first_name + " " + r.last_name, value: r.id }));
    const choices = [{ name: "none", value: null }].concat(allExceptSelectedEmp)
    const answer2 = await inquirer.prompt([
        {
            name: 'manager_id',
            type: 'list',
            message: "Who is the employee's new manager?",
            choices
        }
    ]);
    await connection.query(
        'UPDATE employee SET manager_id = ? WHERE id= ?',
        [answer2.manager_id, answer.employee_id]
    );
    console.log("The employee's manager was successfully updated!")
};

const deleteEmployee = async () => {
    const employees = await queryEmployees();
    const answer = await inquirer.prompt([
        {
            name: 'employee_id',
            type: 'list',
            message: "Which employee would you like to remove?",
            choices: employees.map(r => ({ name: r.first_name + " " + r.last_name, value: r.id }))
        }
    ]);
    await connection.query(
        'UPDATE employee SET manager_id = null WHERE id=?', [answer.employee_id]
    );
    await connection.query(
        'DELETE FROM employee WHERE id=?', [answer.employee_id]
    );
    console.log('The employee was successfully removed!')
};

const displayBudgets = async () => {
    const [rows] = await connection.execute(
        `SELECT d.name department, SUM(salary) budget  
        FROM role r
        JOIN department d ON r.department_id = d.id
        JOIN employee e ON r.id = e.role_id
        
        GROUP BY d.name
        ORDER BY budget DESC`
    );

    console.table(rows);
};


const endProgram = async () => {
    await connection.end();
};

//async/await wrapper to get the connection before initializing the menu prompt
async function main() {
    connection = await getConnection();
    await displayMenu();
};

main();
