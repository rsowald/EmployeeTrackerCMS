const inquirer = require('inquirer');
const connection = require('db/connection');
const { Z_UNKNOWN } = require('node:zlib');
const { SSL_OP_TLS_D5_BUG } = require('node:constants');

const displayMenu = async () => {
    let answer = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all roles',
            'View all departments',
            'Add employee',
            'Add role',
            'Add department',
            'Update employee role',
            'exit',
        ]
    });

    switch (answer.action) {
        case 'View all employees':
            viewEmployees();
            break;

        case 'View all roles':
            viewRoles();
            break;

        case 'View all departments':
            viewDepartments();
            break;

        case 'Add employee':
            insertEmployee();
            break;

        case 'Add role':
            insertRole();
            break;

        case 'Add department':
            insertDepartment();
            break;

        case 'Update employee role':

            break;

        case 'Exit':
            connection.end();
            break;

        default:
            console.log(`Invalid action: ${answer.action}`);
            break;
    }
};

const viewEmployees = async () => {
    await connection.query(
        'SELECT * FROM employees',
        (err, res) => {
            if (err) throw err;
            console.table(res);
            displayMenu();
        }
    );
};

const viewRoles = async () => {
    await connection.query(
        'SELECT * FROM roles',
        (err, res) => {
            if (err) throw err;
            console.table(res);
            displayMenu();
        }
    );
};

const viewDepartments = async () => {
    await connection.query(
        'SELECT * FROM departments',
        (err, res) => {
            if (err) throw err;
            console.table(res);
            displayMenu();
        }
    );
};

const insertEmployee = async () => {
    // prompt for info about the employee
    let answer = await inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: "What is the employee's first name?",
        },
        {
            name: 'lastName',
            type: 'input',
            message: "What is the employee's last name?",
        },
        {
            name: 'role',
            type: 'input',
            message: "What is their job title?",
        },
        {
            name: 'manager',
            type: 'input',
            message: "What is their manager's id? (leave blank if NULL)",
        }
    ]);

    // when finished prompting, insert a employee into the db with that info
    connection.query(
        'INSERT INTO employee SET ?',
        {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.role,
            //TODO: get role ids from role table
            manager_id: answer.manager || NULL,
        },
        (err) => {
            if (err) throw err;
            console.log('Your employee was added successfully!');
            // re-direct to the menu
            runMenu();
        }
    );
};

const insertRole = async () => {
    // prompt for info about the role
    let answer = await inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: "What is the job title?",
        },
        {
            name: 'salary',
            type: 'input',
            message: "What is the salary for this role?",
        },
        {
            name: 'department',
            type: 'input',
            message: "To which department does this role belong?",
        },
    ]);

    // when finished prompting, insert a role into the db with that info
    connection.query(
        'INSERT INTO role SET ?',
        {
            title: answer.title,
            salary: answer.salary,
            department: answer.department,
            //TODO: get department ids from department table
        },
        (err) => {
            if (err) throw err;
            console.log('The role was added successfully!');
            // re-direct to the menu
            runMenu();
        }
    );
};

const insertDepartment = async () => {
    // prompt for info about the role
    let answer = await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: "What is the name of the department?",
        },
    ]);

    // when finished prompting, insert a department into the db with that info
    connection.query(
        'INSERT INTO department SET ?',
        {
            name: answer.name,
        },
        (err) => {
            if (err) throw err;
            console.log('The department was added successfully!');
            // re-direct to the menu
            runMenu();
        }
    );
};

connection.connect((err) => {
    if (err) throw err;
    runMenu();
});